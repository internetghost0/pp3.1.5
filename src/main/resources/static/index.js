'use strict';

let baseURL = "http://localhost:8080/admin/api/v1"

let ROLES;
(async () => {
    ROLES = await listRoles();
    await updateTable();
    await changeHeader();
    await loadUserAddTab();
})();

async function changeHeader() {
    let me = await myUserInfo();
    document.getElementById("header-text").innerHTML =
        `<span><strong>${me['email']}</strong></span> with roles: ${me['rolesString']}`;
}

async function fillModalFields(userId, readOnly = false) {
    let elems = tableList().filter(x => x['id'] === userId.toString()).pop();
    document.getElementById('modal_id').value = elems["id"];
    document.getElementById('modal_firstName').value = elems["firstName"];
    document.getElementById('modal_lastName').value = elems["lastName"];
    document.getElementById('modal_age').value = elems["age"];
    document.getElementById('modal_email').value = elems["email"];
    document.getElementById("modal_roles").innerHTML = ""
    document.getElementById('modal_id').readOnly = readOnly;
    document.getElementById('modal_firstName').readOnly = readOnly;
    document.getElementById('modal_lastName').readOnly = readOnly;
    document.getElementById('modal_age').readOnly = readOnly;
    document.getElementById('modal_email').readOnly = readOnly;
    document.getElementById("modal_roles").readOnly = readOnly;
    document.getElementById('modal_password').readOnly = readOnly;
    ROLES.forEach(function (element) {
        document.getElementById("modal_roles").innerHTML +=
            `<option value="${element.name}">${element.name.replace("ROLE_", "")}</option>`;
    })
}

async function showDeleteModal(userId) {
    await fillModalFields(userId);

    let button = document.getElementById("modal_submit_btn");
    button.className = "btn btn-danger";
    button.textContent = "Delete";
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const formData = new FormData();
        formData.append('_csrf', get_csrf());
        formData.append('id', userId);
        const params = new URLSearchParams(formData);
        fetch(baseURL + '/user', {
            method: "DELETE",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded" // Set the content type if sending JSON data
            },
            body: params.toString()
        })
        setTimeout(updateTable, 1000);
        closeModal();
    });
    showModal();
}

async function showEditModal(userId) {
    await fillModalFields(userId);
    const selectRoles = document.getElementById('modal_roles');
    let button = document.getElementById("modal_submit_btn");
    button.className = "btn btn-primary";
    button.textContent = "Edit";
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const form = document.getElementById("modal-form");
        const inputs = form.querySelectorAll("input");
        const formData = new FormData();

        inputs.forEach(input => {
            formData.append(input.name, input.value);

        });
        formData.append('role', selectRoles.options[selectRoles.selectedIndex].value);
        formData.append('_csrf', get_csrf());

        const params = new URLSearchParams(formData);
        fetch(baseURL + "/user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded" // Set the content type if sending JSON data
            },
            body: params.toString()
        }).then(response => response.json())
            .then(result => {
                // Handle the response or result
                console.log(result);
            })
            .catch(error => {
                // Handle any errors
                console.error(error);
            });
        closeModal();
        setTimeout(updateTable, 1000);

    });

    showModal();
}

function get_csrf() {
    return document.getElementById('csrf-code').value;
}

function showModal() {
    jQuery(document).ready(function (e) {
        jQuery('#customModal').modal();
    });
}

function closeModal() {
    jQuery(document).ready(function (e) {
        jQuery('#customModal').modal("hide");
    });

}

async function listRoles() {
    let resp = await fetch(baseURL + "/roles");
    let result = await resp.json();
    result.map(function (element) {
        element.name
    });
    return result.sort();
}

function clearTable() {
    let elements = document.querySelectorAll('#main-table.table tbody td');
    let userPanelTable = document.querySelectorAll('#userPanel-table.table tbody td');
    userPanelTable.forEach(x => x.remove());
    elements.forEach(x => x.remove());
}

async function updateTable() {
    clearTable();
    let users = await fetch(baseURL + '/');
    users = await users.json();
    const titles = document.querySelectorAll('#main-table.table thead th');
    const table = document.getElementById('main-table');
    for (let i = 0; i < users.length; i++) {
        const newRow = table.insertRow();
        for (let j = 0; j < titles.length; j++) {
            const cell = newRow.insertCell();
            switch (titles[j].abbr) {
                case 'id':
                case 'firstName':
                case 'lastName':
                case 'age':
                case 'email':
                    cell.textContent = users[i][titles[j].abbr];
                    break;
                case 'role':
                    cell.textContent = users[i].rolesString;
                    break;
                case 'editBtn':
                    cell.innerHTML =
                        `<button class="btn btn-primary" data-toggle="modal" type="button" onclick="editUser(${users[i].id})"> Edit </button>`;
                    break;
                case 'deleteBtn':
                    cell.innerHTML =
                        `<button class="btn btn-danger" data-toggle="modal" type="button" onclick="deleteUser(${users[i].id})">Delete</button>`;
                    break;
            }
        }

    }

}


function tableList() {
    let titles = document.querySelectorAll('#main-table.table thead th');
    let elements = document.querySelectorAll('#main-table.table tbody td');
    let result = []
    for (let i = 0; i < elements.length / titles.length; i++) {
        result[i] = {}
        for (let j = 0; j < titles.length; j++) {
            result[i][titles[j].abbr] = elements[i * titles.length + j].textContent;
        }
    }
    return result;
}

async function myUserInfo() {
    let resp = await fetch(baseURL + "/user");
    let result = await resp.json();
    return result;
}

async function editUser(userId) {
    console.log('Edit button clicked for user ID:', userId);
    await showEditModal(userId);
}

async function loadUserAddTab() {
    let button = document.getElementById("btn-create-user");
    let roles = ROLES
    document.getElementById("role_new").innerHTML = "";
    roles.forEach(function (element) {
        document.getElementById("role_new").innerHTML +=
            `<option value="${element.name}">${element.name.replace("ROLE_", "")}</option>`;
    })
    button.addEventListener("click", function (event) {
        event.preventDefault();
        const selectRoleEl = document.getElementById('role_new');
        const role = selectRoleEl.options[selectRoleEl.selectedIndex].value;
        const form = document.getElementById("newUser-form");
        const inputs = form.querySelectorAll("input");
        const formData = new FormData();

        inputs.forEach(input => {
            formData.append(input.name, input.value);

        });
        formData.append('role', role);
        formData.append('_csrf', get_csrf());

        const params = new URLSearchParams(formData);
        fetch(baseURL + "/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded" // Set the content type if sending JSON data
            },
            body: params.toString()
        });
        setTimeout(updateTable, 1000);
        inputs.forEach(input => {
            input.value = "";
        });
        document.getElementById('admin-panel-link').click();

    });
    let me = await fetch(baseURL + '/user');
    me = await me.json();
    const userPanelTable = document.getElementById('userPanel-table')
    const newRow = userPanelTable.insertRow();
    newRow.insertCell().textContent = me['id'];
    newRow.insertCell().textContent = me['firstName'];
    newRow.insertCell().textContent = me['lastName'];
    newRow.insertCell().textContent = me['age'];
    newRow.insertCell().textContent = me['email'];
    newRow.insertCell().textContent = me['rolesString'];


}


async function deleteUser(userId) {
    console.log('Delete button clicked for user ID:', userId);

    await showDeleteModal(userId);
}