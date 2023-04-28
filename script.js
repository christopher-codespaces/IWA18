import { html, createOrderHtml, updateDraggingHtml,updateDraggingFunc, moveToColumn } from "./view.js";

let orders = []

/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath()
    let column = null

    for (const element of path) {
        const { area } = element.dataset
        if (area) {
            column = area
            break;
        }
    }

    if (!column) return
    //updateDragging({ over: column })
    updateDraggingHtml({ over: column })
    updateDraggingFunc({ over: column })
}

let isOpen = false
let sourceCol

const handleDragStart = (event) => {
    // handleDragOver(event)
    // console.log('Drag start', event.composedPath())
    // for (let i = 0; i < event.composedPath().length; i++){
    //     console.log(event.composedPath()[i].dataset)
    // }
    // console.log(html.area)
    // console.log(html.columns)
}
const handleDragEnd = (event) => {
    event.preventDefault()
    // console.log('Drag end')
    // console.log('Source', event.srcElement)
    // console.log('target', event)
    // console.log(event.toElement.parentNode)
    // console.log(html.area)
    // const targetCol = document.querySelector(`[data-id="${event.srcElement.dataset.id}"]`)
    // console.log(targetCol.parentNode.dataset.column)
    let elements = document.querySelectorAll(':hover');
    let column
    console.log(elements)
    for (let i = 0; i < elements.length; i++) {
        console.log(elements[i].dataset.area)
        if(elements[i].dataset.area) {
            column = elements[i].dataset.area
            break
        }
    }
    moveToColumn(event.srcElement.dataset.id, column)
}
const handleHelpToggle = (event) => {
    isOpen = !isOpen

    if (isOpen) {
        document.querySelector('.backdrop').style.display = 'block'
        html.help.overlay.style.display = 'block'
    } else {
        document.querySelector('.backdrop').style.display = 'none'
        html.help.overlay.style.display = 'none'
    }

    checkOverlayAndFocusBtn(html.help.overlay)
}
const handleAddToggle = (event) => {
    isOpen = !isOpen

    if (isOpen) {
        document.querySelector('.backdrop').style.display = 'block'
        html.add.overlay.style.display = 'block'
    } else {
        document.querySelector('.backdrop').style.display = 'none'
        html.add.overlay.style.display = 'none'
    }

    checkOverlayAndFocusBtn(html.add.overlay)
}
const handleAddSubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData)
    const element = createOrderHtml(data)

    orders.push(element)
    html.columns.ordered.appendChild(element)

    event.target.reset()

    document.querySelector('.backdrop').style.display = 'none'
    html.add.overlay.style.display = 'none'
}
const handleEditToggle = (event) => {
    isOpen = !isOpen

    if (isOpen) {
        document.querySelector('.backdrop').style.display = 'block'
        html.edit.overlay.style.display = 'block'

        const editId = event.srcElement.dataset.id
        const editedObj = orders.find(item => item.dataset.id === editId);

        html.edit.id.dataset.editId = editedObj.dataset.id
        html.edit.title.value = editedObj.querySelector('[data-order-title]').textContent
        html.edit.table.value = editedObj.querySelector('[data-order-table]').textContent
        html.edit.column.value = editedObj.parentNode.dataset.column

    } else {
        document.querySelector('.backdrop').style.display = 'none'
        html.edit.overlay.style.display = 'none'
    }

}
const handleEditSubmit = (event) => {
    event.preventDefault()

    const itemId = html.edit.id.dataset.editId 
    const editedObj = orders.find(item => item.dataset.id === itemId);

    const formData = new FormData(event.target)
    formData.set('id', `${itemId}`);
    
    const data = Object.fromEntries(formData)
    //data = {id: 'edit id', title: 'new titl', table: 'new table', column: 'new col'}

    editedObj.querySelector('[data-order-title]').textContent = data.title
    editedObj.querySelector('[data-order-table]').textContent = data.table

    if(data.column == 'ordered') html.columns.ordered.appendChild(editedObj)
    if(data.column == 'preparing') html.columns.preparing.appendChild(editedObj)
    if(data.column == 'served') html.columns.served.appendChild(editedObj)

    event.target.reset()
    document.querySelector('.backdrop').style.display = 'none'
    html.edit.overlay.style.display = 'none'

}
const handleDelete = (event) => {
    const editId = html.edit.id.dataset.editId

    orders = orders.filter( (item) => {
        return item.dataset.id !== editId
    })

    html.columns.ordered.removeChild(document.querySelector(`[data-id="${editId}"]`))

    document.querySelector('.backdrop').style.display = 'none'
    html.edit.overlay.style.display = 'none'
}
const checkOverlayAndFocusBtn = (overlay) => {
    if (overlay.style.display === 'none') {
        html.other.add.focus()
    }
}

console.log('hey')

window.onload = () => html.other.add.focus()

html.add.cancel.addEventListener('click', handleAddToggle)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpToggle)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart)
    htmlColumn.addEventListener('dragend', handleDragEnd)
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver)
}