"use strict";
// ---------- Class: all the data logic lives here ----------
class TodoList {
    constructor() {
        this.todos = [];
        this.nextId = 1;
    }
    add(text) {
        // spread (...) copies the old items, then we add the new one
        this.todos = [...this.todos, { id: this.nextId++, text, done: false }];
    }
    toggle(id) {
        this.todos = this.todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
    }
    edit(id, text) {
        const clean = text.trim();
        if (clean === "") {
            this.remove(id);
            return;
        } // empty text = delete
        this.todos = this.todos.map(t => (t.id === id ? { ...t, text: clean } : t));
    }
    remove(id) {
        this.todos = this.todos.filter(t => t.id !== id);
    }
    clearCompleted() { this.todos = this.todos.filter(t => !t.done); }
    clearAll() { this.todos = []; }
    get itemsLeft() {
        return this.todos.filter(t => !t.done).length;
    }
    getVisible(filter) {
        if (filter === "active")
            return this.todos.filter(t => !t.done);
        if (filter === "completed")
            return this.todos.filter(t => t.done);
        return this.todos;
    }
}
// ---------- DOM: select the elements ----------
const todoList = new TodoList();
let currentFilter = "all";
const input = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("todoList");
const counter = document.getElementById("counter");
const filterButtons = document.querySelectorAll(".filters button");
// ---------- Render: draw the list on the page ----------
function render() {
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
        if (done)
            li.classList.add("done");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = done;
        const span = document.createElement("span");
        span.className = "text";
        span.textContent = text; // textContent is safe (no HTML injection)
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
function addTodo() {
    const text = input.value.trim();
    if (text === "")
        return;
    todoList.add(text);
    input.value = "";
    render();
}
addBtn.addEventListener("click", addTodo);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter")
        addTodo();
});
// Delegation: ONE listener on the <ul> handles every item
function getId(el) {
    const li = el.closest("li");
    return Number(li.dataset.id);
}
listEl.addEventListener("change", (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
        todoList.toggle(getId(target));
        render();
    }
});
listEl.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("delete")) {
        todoList.remove(getId(target));
        render();
    }
});
// Double-click a todo to edit it
listEl.addEventListener("dblclick", (e) => {
    const target = e.target;
    if (!target.classList.contains("text"))
        return;
    const id = getId(target);
    const editor = document.createElement("input");
    editor.className = "edit";
    editor.value = target.textContent ?? "";
    target.replaceWith(editor);
    editor.focus();
    let finished = false;
    const finish = (save) => {
        if (finished)
            return; // avoid running twice (Enter + blur)
        finished = true;
        if (save)
            todoList.edit(id, editor.value);
        render();
    };
    editor.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter")
            finish(true);
        if (ev.key === "Escape")
            finish(false);
    });
    editor.addEventListener("blur", () => finish(true));
});
// Filter buttons: All / Active / Completed
filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFilter = btn.dataset.filter;
        filterButtons.forEach(b => b.classList.toggle("active", b === btn));
        render();
    });
});
document.getElementById("clearCompleted").addEventListener("click", () => {
    todoList.clearCompleted();
    render();
});
document.getElementById("clearAll").addEventListener("click", () => {
    todoList.clearAll();
    render();
});
// Start with the two example items from the lab screenshot
todoList.add("See Lecture");
todoList.add("Solve assignment");
render();
