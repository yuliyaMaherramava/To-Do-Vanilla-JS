  // List of supported routes (from pages.js)
  const routes = {
    loginZone: HomePage,
    main: Board,
    stat: Statistics,
    default: HomePage,
  };

/* ----- spa init module --- */
const mySPA = (function() {

/* ------- begin view -------- */
  function ModuleView() {
    let myModuleContainer = null;
    let routesObj = null;

    this.init = function(container, routes) {
        myModuleContainer = container;
        routesObj = routes;
      }
      
    this.renderContent = function(hashPageName) {
        let routeName = "default";
  
        if (hashPageName.length > 0) {
          routeName = hashPageName in routes ? hashPageName : "error";
        }
  
        window.document.title = routesObj[routeName].title;
        myModuleContainer.innerHTML = routesObj[routeName].render();
      }
    this.showExistData = function(/* data */){
        // ОТОБРАЖАЕМ КАРТОЧКИ
    }
    this.drawCard = function(cardArea, title){
        // создаем элементы, которые будут в карточке
        let h2 = document.createElement('h2');
        h2.innerText = title;
        let input = document.createElement('input');
        input.classList.add("comment");
        let buttonSaveCard = document.createElement('button');
        buttonSaveCard.innerText = '+';
        buttonSaveCard.classList.add("btn-save");
        buttonSaveCard.id = "to-do-list-button";
        let div = document.createElement('div');
        let todoListElement = document.createElement('div');
        cardArea.append(todoListElement);
        //добавляем в карточку созданные выше элемениы
        todoListElement.append(h2);
        todoListElement.append(input);
        todoListElement.append(buttonSaveCard);
        todoListElement.append(div);
        todoListElement.classList.add("todoList");
        
        //вешаем слушатель на кнопку
        buttonSaveCard.addEventListener('click', ()=>{
            if(input.value != ""){
                // this.addToDo.call(this);
                input.value = "";
            }
        });

    }

  }
 /* -------- end view --------- */
/* ------- begin model ------- */
function ModuleModel () {
    let myModuleView = null;
    let cardCollection = {};

      this.init = function(view) {
        myModuleView = view;
      }
      this.updateState = function() {
        const hashPageName = window.location.hash.slice(1).toLowerCase();
        myModuleView.renderContent(hashPageName);
      }
      this.downloadData = function(){
          //делаем запрос на сервер , есть ли данные для отображения
          //если есть , то парсим их и отдаем во view
          myModuleView.showExistData( /* data */);
      }
      this.createUser = function(){
          //делаем запрос на сервер для сохранения данных
      }
      this.сreateCard = function(cardArea, title){
        myModuleView.drawCard(cardArea, title);
      }
}
/* -------- end model -------- */
/* ----- begin controller ---- */
function ModuleController () {
    let myModuleContainer = null;
    let myModuleModel = null;

    this.init = function(container, model) {
      myModuleContainer = container;
      myModuleModel = model;

      // вешаем слушателей на событие hashchange и кликам по пунктам меню
      window.addEventListener("hashchange", this.updateState);

      this.updateState(); //первая отрисовка
      this.updateButtonsLoginZone();//вешаем слушатели на кнопки логин окна
      this.updateButtonsBoardZone();//вешаем слушатели на кнопки доски

    }
    this.updateButtonsLoginZone = function(){
        //если нажали кнопку "войти"
        let buttonLogIn = document.getElementById("modal-save-exist"); 
        if(buttonLogIn){//если есть такой элемент, то навешиваем слушатель
          buttonLogIn.addEventListener('click', ()=>{
              let loginInput = document.getElementById("name");
              let passwordInput = document.getElementById("password");
              //отправляем запрос есть ли данные на сервере
              myModuleModel.downloadData(loginInput,passwordInput);
          })
        }
        //если нажали кнопку "создать"
        let buttonCreate = document.getElementById("modal-save-exist"); 
        if(buttonCreate){ //если есть такой элемент, то навешиваем слушатель
          buttonCreate.addEventListener('click', ()=>{
              let newUserInput = document.getElementById("name-new");
              let newPasswordInput = document.getElementById("password-new");
              //отправляем на сервер для создания пользователя
              myModuleModel.createUser(newUserInput,newPasswordInput);
          })
        }
    }
    this.updateButtonsBoardZone = function(){
        let addCardButton = document.getElementById("addCardButton");
        let addCardInput = document.getElementById("addCardInput");
        let cardArea = document.getElementById("cardCollection");
      
        if(addCardButton){//если есть такой элемент, то навешиваем слушатель
            addCardButton.addEventListener('click',()=>{
            if (addCardInput.value.trim() != ""){
                myModuleModel.сreateCard(cardArea,addCardInput.value);
                addCardInput.value = "";
                }
            });
        }
    }
    this.updateState = function() {
      myModuleModel.updateState();
    }
}
/* ------ end controller ----- */

return {
    init: function({container, routes}) {

        const view = new ModuleView();
        const model = new ModuleModel();
        const controller = new ModuleController();

        //связываем части модуля
        view.init(document.getElementById(container), routes);
        model.init(view);
        controller.init(document.getElementById(container), model);
    },    
}
}());
/* ------ end app module ----- */


/*** --- init module --- ***/
document.addEventListener("DOMContentLoaded", mySPA.init({
    container: "spa",
    routes: routes,
  }));
  