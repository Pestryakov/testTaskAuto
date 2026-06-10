import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/todo.page';

test.describe('Todo App', () => {

  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  // TC-01
  test('TC-01: Добавление задачи кнопкой Add', async () => {
    const title = 'Buy milk';
    const countBefore = await todoPage.getTaskCount();

    await todoPage.addTask(title);

    // Ждём появления новой задачи
    await expect(todoPage.taskList).toHaveCount(countBefore + 1);
    await expect(todoPage.getTaskTitle(0)).toContainText(title);

    // Поле ввода должно очиститься
    await expect(todoPage.taskInput).toHaveValue('');
  });

  // TC-02
  test('TC-02: Добавление задачи нажатием Enter', async () => {
    const title = 'Task via Enter';
    const countBefore = await todoPage.getTaskCount();

    await todoPage.addTaskByEnter(title);

    await expect(todoPage.taskList).toHaveCount(countBefore + 1);
    await expect(todoPage.getTaskTitle(0)).toContainText(title);
    await expect(todoPage.taskInput).toHaveValue('');
  });

  // TC-03
  test('TC-03: Отметка задачи как выполненной', async () => {
    // Берём первую невыполненную задачу
    const isCompleted = await todoPage.isTaskCompleted(0);
    
    await todoPage.toggleTask(0);

    // Ждём ответа от API
    await todoPage.page.waitForTimeout(1000);

    const isCompletedAfter = await todoPage.isTaskCompleted(0);
    expect(isCompletedAfter).toBe(!isCompleted);
  });

  // TC-04
  test('TC-04: Редактирование задачи', async () => {
    const newTitle = 'Edited task title';

    await todoPage.clickEdit(0);
    await todoPage.saveEdit(0, newTitle);

    // Ждём ответа от API
    await todoPage.page.waitForTimeout(1000);

    await expect(todoPage.getTaskTitle(0)).toContainText(newTitle);
  });

  // TC-05
  test('TC-05: Удаление задачи', async () => {
    const countBefore = await todoPage.getTaskCount();

    await todoPage.clickDelete(0);

    // Ждём ответа от API
    await todoPage.page.waitForTimeout(1000);

    await expect(todoPage.taskList).toHaveCount(countBefore - 1);
  });

  // TC-06
  test('TC-06: Фильтр Active показывает только невыполненные задачи', async () => {
    await todoPage.filterActive.click();

    const tasks = todoPage.taskList;
    const count = await tasks.count();

    // Проверяем каждую задачу в списке — ни одна не должна быть выполненной
    for (let i = 0; i < count; i++) {
      const title = tasks.nth(i).locator('.task-title');
      await expect(title).not.toHaveClass(/completed/);
    }
  });

  // TC-07
  test('TC-07: Фильтр Completed показывает только выполненные задачи', async () => {
    await todoPage.filterCompleted.click();

    const tasks = todoPage.taskList;
    const count = await tasks.count();

    // Каждая задача должна иметь класс completed
    for (let i = 0; i < count; i++) {
      const title = tasks.nth(i).locator('.task-title');
      await expect(title).toHaveClass(/completed/);
    }
  });

  // TC-08
  test('TC-08: Пустая задача не добавляется', async () => {
    const countBefore = await todoPage.getTaskCount();

    await todoPage.addTask('');

    // Список не должен измениться
    await expect(todoPage.taskList).toHaveCount(countBefore);
  });

  // TC-09
  test('TC-09: Задача из пробелов не добавляется', async () => {
    const countBefore = await todoPage.getTaskCount();

    await todoPage.addTask('   ');

    await expect(todoPage.taskList).toHaveCount(countBefore);
  });

  // TC-10
  test('TC-10: Задачи не сохраняются после перезагрузки (особенность API)', async ({ page }) => {
    const newTitle = 'This task will disappear';
    await todoPage.addTask(newTitle);

    // Убеждаемся что задача добавилась
    await expect(todoPage.getTaskTitle(0)).toContainText(newTitle);

    // Перезагружаем страницу
    await page.reload();
    await page.waitForSelector('.task-item', { timeout: 10000 });

    // Задачи не должно быть — API не сохраняет данные
    const titles = page.locator('.task-title');
    const count = await titles.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      if (text?.includes(newTitle)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(false);
  });

});
