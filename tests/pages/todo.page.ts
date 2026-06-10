import { Page, Locator, expect } from '@playwright/test';

export class TodoPage {
  readonly page: Page;

  // Локаторы
  readonly taskInput: Locator;
  readonly addButton: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;
  readonly taskList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.taskInput = page.locator('input.task-input');
    this.addButton = page.locator('button.add-button');
    this.filterAll = page.locator('button', { hasText: 'All' });
    this.filterActive = page.locator('button', { hasText: 'Active' });
    this.filterCompleted = page.locator('button', { hasText: 'Completed' });
    this.taskList = page.locator('.task-item');
  }

  // Открыть приложение
  async goto() {
    await this.page.goto('http://localhost:4200');
    // Ждём загрузки задач из API
    await this.page.waitForSelector('.task-item', { timeout: 10000 });
  }

  // Добавить задачу кнопкой
  async addTask(title: string) {
    await this.taskInput.fill(title);
    await this.addButton.click();
  }

  // Добавить задачу через Enter
  async addTaskByEnter(title: string) {
    await this.taskInput.fill(title);
    await this.taskInput.press('Enter');
  }

  // Получить задачу по индексу (0 = первая)
  getTaskItem(index: number): Locator {
    return this.taskList.nth(index);
  }

  // Получить заголовок задачи по индексу
  getTaskTitle(index: number): Locator {
    return this.taskList.nth(index).locator('.task-title');
  }

  // Нажать чекбокс у задачи
  async toggleTask(index: number) {
    await this.taskList.nth(index).locator('input[type="checkbox"]').click();
  }

  // Нажать Edit у задачи
  async clickEdit(index: number) {
    await this.taskList.nth(index).locator('button.edit-button').click();
  }

  // Нажать Delete у задачи
  async clickDelete(index: number) {
    await this.taskList.nth(index).locator('button.delete-button').click();
  }

  // Сохранить отредактированную задачу
  async saveEdit(index: number, newTitle: string) {
    const editInput = this.taskList.nth(index).locator('input.edit-input');
    await editInput.clear();
    await editInput.fill(newTitle);
    await this.taskList.nth(index).locator('button.save-button').click();
  }

  // Получить количество задач в списке
  async getTaskCount(): Promise<number> {
    return await this.taskList.count();
  }

  // Проверить что задача выполнена (перечёркнута)
  async isTaskCompleted(index: number): Promise<boolean> {
    const title = this.getTaskTitle(index);
    const classes = await title.getAttribute('class');
    return classes?.includes('completed') ?? false;
  }
}
