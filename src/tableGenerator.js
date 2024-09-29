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
      addDeletButton(trBody,rowId, config.parent);

      console.log(config.parent)
      tbody.appendChild(trBody);
    }
 }

 function addDeletButton(row, itemId, selectorOfTable){
  try{
    const td = document.createElement('td');
    const button = document.createElement('button');

    button.classList.add('delete-button');
        
    button.textContent = 'Delete';
    
    button.onclick = function () { deleteItem(itemId, row, selectorOfTable) }
    td.appendChild(button);
    row.appendChild(td)
  }
    catch(e){
      console.log(e)
    }
 }
 
 function deleteItem(itemId,row, selectorOfTable){
  const url = `https://mock-api.shpp.me/nzubyk/users/${itemId}`
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
      {title: 'Назва', value: 'title'},
      {title: 'Ціна', value: (product) => `${product.price} ${product.currency}`},
      {title: 'Колір', value: (product) => getColorLabel(product.color)}, // функцію getColorLabel вам потрібно створити
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

