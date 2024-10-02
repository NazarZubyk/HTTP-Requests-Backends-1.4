async function DataTable(config, data) {
  let arrayOfDate = [] ;
  //fetch data if not exist and parse it
    if(!data){
        const response = await fetch(config.apiUrl);
        
        const parserData = await response.json();
        data = parserData.data;
         arrayOfDate =   Object.entries(data)

         
        
    }

    //append to the needed div, create head and body of table
    const table = document.querySelector(config.parent);
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    //connect body and head to table
    table.appendChild(thead);
    table.appendChild(tbody);

    //create and connect row for head of table
    const trHead = document.createElement('tr');
    thead.appendChild(trHead);

    //ceate symbol of first column and put in left top cell
    const firstTd = document.createElement('td');
    firstTd.innerHTML = "№";
    trHead.appendChild(firstTd)

    //massive for keys names from config
    let values = [];

    //parse keys of config and set names of collums for them
    for(let title of config.columns){
      values.push(title.value);
      const td = document.createElement('td');
      td.innerHTML = title.title;
      trHead.appendChild(td);
    }

    //create collum for buttons
    const td = document.createElement('td');

    
    trHead.appendChild(td);


    addCreateButton( td, config); ///////////////////////////////////////////////////////////////////////

    //create counter for rows
    let counter = 1;
    for(let key in arrayOfDate){
      //get data for row and create body row for it
      const row = arrayOfDate[key][1];
      const rowId = arrayOfDate[key][0];
      const trBody = document.createElement('tr');

      //append cell for number and set data
      const firstTd = document.createElement('td');
      firstTd.innerHTML = counter;
      trBody.appendChild(firstTd);
      counter++;

      
      //using value of keys, get data and set in appropriate cells
      for(let value of values){
        const td = document.createElement('td');

        //if data is function run it
        if (typeof value === 'function') {
          const result = value(row);
          if (result instanceof HTMLElement) {
            td.appendChild(result);
          } else {
            td.innerHTML = result;
          }
        } else {
          td.innerHTML = row[value];
        }

        trBody.appendChild(td)
      }
      //create and put delete button
      addDeletAndEditButton(trBody,rowId, config.parent,config, data);
      tbody.appendChild(trBody);
    }
 }

 function addCreateButton( td, config) {
  const button = document.createElement('button');

  button.classList.add('create-button');
  button.textContent = 'Create';

  button.onclick = function () {
    openCreateModal(config);
  };

  td.appendChild(button);
}


function openCreateModal(config) {
  // Create the modal if it doesn't exist
  let modal = document.getElementById('createModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'createModal';
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const closeBtn = document.createElement('span');
    closeBtn.classList.add('close');
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = function () {
      modal.style.display = 'none';
    };

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Create New Product';

    const form = document.createElement('form');
    form.id = 'createProductForm';
    form.classList.add('form');

    const submitButton = document.createElement('button');
    submitButton.id = 'submitCreateForm';
    submitButton.textContent = 'Create';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(form);
    modalContent.appendChild(submitButton);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Handle form submission
    submitButton.onclick = function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      
      const product = {};
      formData.forEach((value, key) => {
        const column = config.columns.find(column => column.value === key);
        if (column && column.input.type === 'number') {
          product[key] = parseFloat(value);
        } else {
          product[key] = value;
        }
      });
      let isValid = true;
      
      config.columns.forEach((column) => {
        if ((column.input.required === true || column.input.required === undefined) && product[column.value] === ''){
          alert(`Please fill in the ${column.title} field`);
          isValid = false;
        }
        if (column.input.length > 0) {
          column.input.forEach((input) => {
            if ((column.input.required === true || column.input.required === undefined) && product[column.value] === '') {
              alert(`Please fill in the ${input.label} field`);
              isValid = false;
            }
          });
        }
      });
      
      if (isValid) {
        
        createProduct(product, config.apiUrl,() => {
          const table = document.querySelector(config.parent);
          table.innerHTML = '';
          // Re-render the table with the new data
          DataTable(config, config.data);
        });
        modal.style.display = 'none';
      }
    };
    
  }


  // Clear previous form fields
  const form = document.getElementById('createProductForm');
  form.innerHTML = '';

  // Generate form fields based on config
  config.columns.forEach(column => {
    const label = document.createElement('label');
    label.textContent = column.title;
    form.appendChild(label);
  
    if (Array.isArray(column.input)) {
      column.input.forEach(inputConfig => {
        if (inputConfig.type === 'select') {
          const select = document.createElement('select');
          select.name = inputConfig.name || column.value;
          inputConfig.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
          });
          form.appendChild(select);
        } else if (inputConfig.type === 'color') {
          const input = document.createElement('input');
          input.type = 'color';
          input.name = inputConfig.name || column.value;
          input.value = '#000000'; // default color value
          form.appendChild(input);
        } else {
          const input = document.createElement('input');
          input.type = inputConfig.type;
          input.name = inputConfig.name || column.value;
          input.placeholder = inputConfig.label || column.title;
          if (inputConfig.required !== false) input.required = true;
          form.appendChild(input);
        }
      });
    } else if (column.input.type === 'select') {
      const select = document.createElement('select');
      select.name = column.input.name || column.value;
      column.input.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
      });
      form.appendChild(select);
    } else if (column.input.type === 'color') {
      const input = document.createElement('input');
      input.type = 'color';
      input.name = column.input.name || column.value;
      input.value = '#000000'; // default color value
      form.appendChild(input);
    } else {
      const input = document.createElement('input');
      input.type = column.input.type;
      input.name = column.input.name || column.value;
      input.placeholder = column.input.label || column.title;
      if (column.input.required !== false) input.required = true;
      form.appendChild(input);
    }
  });

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };

  return modal;
}


function createProduct(product, apiUrl, callback) {
  const replacer = (key, value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (key === 'price') {
      return Number(value);
    }
    return value;
  };
  const body = JSON.stringify(product, replacer)
  console.log(body);
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Product created:', data);
      if (callback) {
        callback(); // Execute the callback function
      }
    })
    .catch(error => {
      console.error('Error creating product:', error);
    });
}

function updateProduct(id, product, apiUrl, callback) {
  const replacer = (key, value) => {
    if (typeof value === 'number') {
      return value;
    }
    if (key === 'price') {
      return Number(value);
    }
    return value;
  };
  const body = JSON.stringify(product, replacer)
  console.log(body);
  fetch(`${apiUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: body
  })
    .then(response => response.json())
    .then(data => {
      console.log('Product updated:', data);
      if (callback) {
        callback(); // Execute the callback function
      }
    })
    .catch(error => {
      console.error('Error updating product:', error);
    });
}

 function addDeletAndEditButton(row, itemId, selectorOfTable,config,data){
  try{
    const td = document.createElement('td');
    const buttonDelete = document.createElement('button');
    const buttonEdit = document.createElement('button');

    buttonDelete.classList.add('delete-button');
    buttonEdit.classList.add('edit-button'); 
        
    buttonDelete.textContent = 'Delete';
    buttonEdit.textContent = 'Edit';
    
    buttonDelete.onclick = function () { deleteItem(itemId, row, selectorOfTable,config) };
    buttonEdit.onclick = function () { openEditModal(itemId, selectorOfTable,config,data) };

    td.appendChild(buttonDelete);
    td.appendChild(buttonEdit);

    row.appendChild(td)
  }
    catch(e){
      console.log(e)
    }
 }
 async function openEditModal(itemId, selectorOfTable, config, data) {
  console.log(`Opening edit modal for item ${itemId}`);
  // Get the row data
  const rowData = await getRowData(itemId, selectorOfTable, data);
  console.log(`Row data for item ${itemId}:`, rowData);
  // Create an edit form
  const editForm = createEditForm(rowData, config);
  console.log(editForm) 
  console.log(`Created edit form for item ${itemId}`);
  // Add some CSS classes to structure the form
  editForm.classList.add('edit-form-container');
  const formElements = editForm.children;
  for (let i = 0; i < formElements.length; i++) {
    const element = formElements[i];
    if (element.tagName === 'DIV') {
      element.classList.add('form-group');
    }
  }
  // Add the edit form to the page
  const modal = document.createElement('div');
  modal.classList.add('edit-modal');
  modal.appendChild(editForm);
  document.body.appendChild(modal);

  console.log(`Added edit form to the page for item ${itemId}`);
  // Add an event listener to the save button
  editForm.querySelector('.save-button').addEventListener('click', (event) => {
    const formData = {};
    const formElements = editForm.elements;
    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      if (element.name) {
        formData[element.name] = element.value;
      }
    }

  // Update the product data
  const updatedProduct = { ...rowData, ...formData };
  console.log(`Updated product data for item ${itemId}:`, updatedProduct);
  updateProduct(itemId, updatedProduct, config.apiUrl,() => {
    const table = document.querySelector(config.parent);
    table.innerHTML = '';
    // Re-render the table with the new data
    DataTable(config, config.data);}
  );
    // Update the row data
    //updateRowData(itemId, rowData, editForm, config);

    // Close the modal
    modal.remove();
  });

  console.log(`Added save button click event listener for item ${itemId}`);
  // Add an event listener to the cancel button
  editForm.querySelector('.cancel-button').addEventListener('click', (event) => {
    // Close the modal
    modal.remove();
  });

  console.log(`Added cancel button click event listener for item ${itemId}`);
}

function createEditForm(rowData, config) {
  const form = document.createElement('form');
  form.classList.add('edit-form'); 
  

  config.columns.forEach((column) => {
    const inputContainer = document.createElement('div');
    form.appendChild(inputContainer);

    const label = document.createElement('label');
    label.textContent = column.title;
    inputContainer.appendChild(label);

    if (column.input.type === 'text') {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = column.value;
      input.value = rowData[column.value];
      inputContainer.appendChild(input);
    } else if (column.input.type === 'number') {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = column.input.name;
      input.value = rowData[column.input.name];
      inputContainer.appendChild(input);
    } else if (column.input.type === 'select') {
      const select = document.createElement('select');
      select.name = column.input.name;
      column.input.options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        if (rowData[column.input.name] === option) {
          optionElement.selected = true;
        }
        select.appendChild(optionElement);
      });
      inputContainer.appendChild(select);
    } else if (column.input.type === 'color') {
      const input = document.createElement('input');
      input.type = 'color';
      input.name = column.input.name;
      input.value = rowData[column.input.name];
      inputContainer.appendChild(input);
    } else if (Array.isArray(column.input)) {
      column.input.forEach((inputField) => {
        if (inputField.type === 'number') {
          const input = document.createElement('input');
          input.type = 'number';
          input.name = inputField.name;
          input.value = rowData[inputField.name];
          inputContainer.appendChild(input);
        } else if (inputField.type === 'select') {
          const select = document.createElement('select');
          select.name = inputField.name;
          inputField.options.forEach((option) => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            if (rowData[inputField.name] === option) {
              optionElement.selected = true;
            }
            select.appendChild(optionElement);
          });
          inputContainer.appendChild(select);
        }
      });
    }
  });

  const buttonContainer = document.createElement('div');
  form.appendChild(buttonContainer);

  const saveButton = document.createElement('button');
  saveButton.classList.add('save-button');
  saveButton.textContent = 'Save';
  buttonContainer.appendChild(saveButton);

  const cancelButton = document.createElement('button');
  cancelButton.classList.add('cancel-button');
  cancelButton.textContent = 'Cancel';
  buttonContainer.appendChild(cancelButton);
  
 

  return form;
}
async function getRowData(itemId, selectorOfTable,data) {
  
  return data[itemId];
}



function updateRowData(itemId, rowData, editForm, config) {
  rowData.name = editForm.querySelector('#name').value;
  rowData.price = editForm.querySelector('#price').value;
  const url = `${config.apiUrl}/${itemId}`;
  const body = JSON.stringify(rowData);
  fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  })
    .then((response) => {
      if (response.ok) {
        console.log('Resource updated successfully');
        return response.json();
      } else {
        console.error('Failed to update resource:', response.status, response.statusText);
        throw new Error('Failed to update resource');
      }
    })
}
 function deleteItem(itemId,row, selectorOfTable,config){
  const url = `${config.apiUrl}/${itemId}`
  fetch(url, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json',
    },
  })
  .then(response => {
      if (response.ok) {
          console.log('Resource deleted successfully');
          row.remove();
          updateCounters(selectorOfTable)
          return response.json(); 
      } else {
          console.error('Failed to delete resource:', response.status, response.statusText);
          throw new Error('Failed to delete resource');
      }
  })
 }

 function updateCounters(selectorOfTable) {
  const rows = document.querySelectorAll(`${selectorOfTable} tbody tr`); // Adjust the selector if needed
  rows.forEach((row, index) => {
    const firstTd = row.querySelector('td:first-child');
    if (firstTd) {
      firstTd.innerHTML = index + 1; // Update the counter value
    }
  });
}
 
 const config1 = {
   parent: '#usersTable',
   columns: [
     {title: 'Ім’я', value: 'name'},
     {title: 'Прізвище', value: 'surname'},
     {title: 'Вік', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
     {title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>` }
   ],
   apiUrl: "https://mock-api.shpp.me/nzubyk/users"
 };

  const config2 = {
    
      parent: '#productsTable',
      columns: [
        {
          title: 'Назва', 
          value: 'title', 
          input: { type: 'text' }
        },
        {
          title: 'Ціна', 
          value: (product) => `${product.price} ${product.currency}`,
          input: [
            { type: 'number', name: 'price', label: 'Ціна' },
            { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
          ]
        },
        {
          title: 'Колір', 
          value: (product) => getColorLabel(product.color), 
          input: { type: 'color', name: 'color' }
        }, 
      ],
      apiUrl: "https://mock-api.shpp.me/nzubyk/products"
  };
  
 function getAge(birthday) {
    const birthDate = new Date(birthday);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
}

function getColorLabel(color) {
  const colorDiv = document.createElement('div');
  colorDiv.style.width = '20px';
  colorDiv.style.height = '20px';
  colorDiv.style.backgroundColor = color;
  colorDiv.style.display = 'inline-block';
  colorDiv.style.marginRight = '5px';
  return colorDiv;
}

 DataTable(config1);
 DataTable(config2);

