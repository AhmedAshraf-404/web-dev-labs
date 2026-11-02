// ---------- Types (TypeScript feature) ----------
interface Todo {
  id: number;
  text: string;
  done: boolean;
}
type Filter = "all" | "active" | "completed";

// ---------- Class: all the data logic lives here ----------
class TodoList {
  private todos: Todo[] = [];
  private nextId = 1;

  add(text: string): void {
    // spread (...) copies the old items, then we add the new one
    this.todos = [...this.todos, { id: this.nextId++, text, done: false }];
  }

  toggle(id: number): void {
    this.todos = this.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  }

  edit(id: number, text: string): void {
    const clean = text.trim();
    if (clean === "") { this.remove(id); return; }   // empty text = delete
    this.todos = this.todos.map(t => (t.id === id ? { ...t, text: clean } : t));
  }

  remove(id: number): void {
    this.todos = this.todos.filter(t => t.id !== id);
  }

  clearCompleted(): void { this.todos = this.todos.filter(t => !t.done); }
  clearAll(): void { this.todos = []; }

  get itemsLeft(): number {
    return this.todos.filter(t => !t.done).length;
  }

  getVisible(filter: Filter): Todo[] {
    if (filter === "active") return this.todos.filter(t => !t.done);
    if (filter === "completed") return this.todos.filter(t => t.done);
    return this.todos;
  }
}

// ---------- DOM: select the elements ----------
const todoList = new TodoList();
let currentFilter: Filter = "all";

const input = document.getElementById("todoInput") as HTMLInputElement;
const addBtn = document.getElementById("addBtn") as HTMLButtonElement;
const listEl = document.getElementById("todoList") as HTMLUListElement;
const counter = document.getElementById("counter") as HTMLSpanElement;
const filterButtons = document.querySelectorAll<HTMLButtonElement>(".filters button");

// ---------- Render: draw the list on the page ----------
function render(): void {
  listEl.innerHTML = "";
  const visible = todoList.getVisible(currentFilter);

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "Nothing here yet.";
    listEl.appendChild(empty);
  }

  // destructuring: pull id, text, done out of each todo
  visible.forEach(({ id, text, done }) => {
    const li = document.createElement("li");
    li.dataset.id = String(id);
    if (done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = done;

    const span = document.createElement("span");
    span.className = "text";
    span.textContent = text;          // textContent is safe (no HTML injection)

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "🗑";
    del.title = "Delete";

    li.append(checkbox, span, del);
    listEl.appendChild(li);
  });

  const n = todoList.itemsLeft;
  counter.textContent = `${n} item${n === 1 ? "" : "s"} left`;
}

// ---------- Events ----------
function addTodo(): void {
  const text = input.value.trim();
  if (text === "") return;
  todoList.add(text);
  input.value = "";
  render();
}

addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") addTodo();
});

// Delegation: ONE listener on the <ul> handles every item
function getId(el: HTMLElement): number {
  const li = el.closest("li") as HTMLLIElement;
  return Number(li.dataset.id);
}

listEl.addEventListener("change", (e: Event) => {
  const target = e.target as HTMLElement;
  if (target instanceof HTMLInputElement && target.type === "checkbox") {
    todoList.toggle(getId(target));
    render();
  }
});

listEl.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("delete")) {
    todoList.remove(getId(target));
    render();
  }
});

// Double-click a todo to edit it
listEl.addEventListener("dblclick", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  if (!target.classList.contains("text")) return;

  const id = getId(target);
  const editor = document.createElement("input");
  editor.className = "edit";
  editor.value = target.textContent ?? "";
  target.replaceWith(editor);
  editor.focus();

  let finished = false;
  const finish = (save: boolean): void => {
    if (finished) return;            // avoid running twice (Enter + blur)
    finished = true;
    if (save) todoList.edit(id, editor.value);
    render();
  };

  editor.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter") finish(true);
    if (ev.key === "Escape") finish(false);
  });
  editor.addEventListener("blur", () => finish(true));
});

// Filter buttons: All / Active / Completed
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter as Filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

document.getElementById("clearCompleted")!.addEventListener("click", () => {
  todoList.clearCompleted();
  render();
});
document.getElementById("clearAll")!.addEventListener("click", () => {
  todoList.clearAll();
  render();
});

// Start with the two example items from the lab screenshot
todoList.add("See Lecture");
todoList.add("Solve assignment");
render();
