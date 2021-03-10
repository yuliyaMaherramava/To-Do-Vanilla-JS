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
    this.cardArray = [];
    let that = this;
    let draggedTask = null;
    let draggedCard = null;
    let refToTaskClass = null;

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
    this.showExistData = function(data){
      this.cardArray = [];
      setTimeout(function(){
        for(let card in data.cards){
          let curCard = new Card(data.cards[card].cardTitle);
          that.cardArray.push(curCard);
           for(let task in data.cards[card].taskArray){
             let searchedTasks = data.cards[card].taskArray;
             let containerForTasks = document.querySelectorAll('.taskCollection');
             let newTask = new Task(searchedTasks[task].taskName, containerForTasks[card], curCard , searchedTasks[task].description, searchedTasks[task].comments);
             curCard.taskArray.push(newTask);
          }
        }
      },0);
    }
    this.createCard = function(addCardInput){
      this.cardArray.push(new Card(addCardInput));
    }
    this.showError = function(){
      let errorText = myModuleContainer.querySelector("#modal_login");
      let errorInput = errorText.querySelector("#errorInput");
      if (errorInput){
        errorInput.innerHTML = 'Неверный пользователь или пароль';
        errorInput.style.color = 'red';
      }
    } 
    this.drawStatistBars = function(){
      const w = document.querySelector('#svg').offsetWidth - 20;
			const h = 370;
      let barPadding = 5;
      let cardData = [];
      let margin = 30;
      //создаем массив для отрисовки через svg
      for( let i = 0; i < this.cardArray.length; i++){
        cardData.push({name:this.cardArray[i].title, score:this.cardArray[i].taskArray.length})
      }
      // длина оси X= ширина контейнера svg - отступ слева и справа
      let xAxisLength = w - 2 * margin;     
      // длина оси Y = высота контейнера svg - отступ сверху и снизу
      let yAxisLength = h - 2 * margin;
      // функция интерполяции значений на ось X
      let xScale = d3.scale.ordinal()
              .rangeRoundBands([0, xAxisLength], .1) // принимает отрезок, на котором будут располагаться названия карточек ([0, xAxisLength + margin]), а также коэффициент масштабирования столбиков - 0.1.
              .domain(cardData.map(function(d) { return d.name; })); //получает данные, с которыми будет сопоставляться вышеопределенный отрезок [0, xAxisLength + margin].  
      // функция интерполяции значений на ось Y
      let yScale = d3.scale.linear()
          .domain([   
                  d3.min(cardData, function(d) { return d.score - 10; }),
                  d3.max(cardData, function(d) { return d.score + 10; })
          ]).range([yAxisLength, 0]);

      //создаем впсплывающие подсказки на графике
      let tip = d3.tip()
        .attr('class', 'd3-tip')
        .attr('id', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          return "<strong>Карточек:</strong> <span>" + d.score + "</span>";
      })    
      // добавляеv новый <svg> элемент в нашем диве #spa
      // и определяеv ширину и высоту, которую указали выше
      //присваиваем переменной svg результат выполнения
      let svg = d3.select("#svg").append("svg")
              .attr("class", "axis")
              .attr("width", w)
              .attr("height", h)
              .call(tip);
      // перемешаем наши подсказки из body(по умолчанию) в div svg
      document.getElementById('svg').appendChild(document.getElementById('d3-tip'));
      // создаем ось X   
      var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom");
      // создаем ось Y             
      var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left");     
      // отрисовка оси Х             
      svg.append("g")       
          .attr("class", "x-axis")
          .attr("transform",
              "translate(" + margin + "," + (h - margin) + ")")
          .call(xAxis);
      // рисуем горизонтальные линии 
      d3.selectAll("g.y-axis g.tick")
          .append("line")
          .classed("grid-line", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", xAxisLength)
          .attr("y2", 0);
      // создаем элемент g с набором столбиков
      svg.append("g")
          .attr("transform",  // сдвиг оси вправо
              "translate(" + margin + ", 0)")
          .selectAll(".bar")
          .data(cardData)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return xScale(d.name); })
          .attr("width", xScale.rangeBand())
          .attr("y", function(d) { return yScale(d.score); })
          .attr("height", function(d) { return h - yScale(d.score) - 30; })
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .attr("fill", "#6c61e0")
    }
    this.showUpdatedState = function(){
      let showState = document.createElement('div');
      showState.id = 'show-state';
      showState.innerHTML = `<p>Данные обновлены</p>`;
      myModuleContainer.prepend(showState);
      setTimeout(()=>{showState.remove()}, 10000);
    }
    this.showInvalidInp = function(id){
      let errorContainer = myModuleContainer.querySelector(id);
      let errorInput = errorContainer.querySelector("#errorInput");
      if (errorInput){
        errorInput.innerHTML = 'Введите данные';
        errorInput.style.color = 'red';
      }
    }
    this.dropCard = function(e,cardColl){
      cardColl.append(draggedCard);
      draggedCard = null;
    }
    class Card{
      constructor(title){
          this.container = null;
          this.taskContainer = null;
          this.title = title;
          this.taskArray = [];
          this.createCard();
      }
      //создаем задание в карточке
      addTask(taskName, container){
        //передаем заголовок задачи, контейнер куда задачу добавить и контекст this (сам экземляр объекта Card)
          this.taskArray.push(new Task(taskName, container,this)); 
      }
      //создаём карточку и наполняем её элементами
      createCard(){
        let self = this;
        //сама карточка
        let card = document.createElement('div');
        card.classList.add("card");
        card.setAttribute('draggable','true');
        // заголовок карточки
          let h2 = document.createElement('h2');
          h2.innerText = this.title;
        //поле ввода для введения новой задачи
          let inputTask = document.createElement('input');
          inputTask.classList.add("comment");
        // кнопка создать новую задачу
          let buttonAddTask = document.createElement('button');
          buttonAddTask.innerText = '+';
          buttonAddTask.classList.add("btn-save");
          buttonAddTask.id = "card-button";
        //кнопка удалить карточку
          let buttonDeleteTask = document.createElement('button');
          buttonDeleteTask.innerText = 'x';
          buttonDeleteTask.classList.add("btn-close");
          buttonDeleteTask.id = "card-delete-task"

        // элемент в котором будут храниться все задачи
          let taskCollection = document.createElement('div');
          this.taskContainer = taskCollection;
          taskCollection.classList.add("taskCollection");

          //добавляем все элементы в DOM
          card.append(h2);
          card.append(buttonDeleteTask);
          card.append(inputTask);
          card.append(buttonAddTask);
          card.append(taskCollection);

          this.container = document.querySelector('#cardCollection');
          this.container.append(card);

           //вешаем слушатель на перетаскивания
          card.addEventListener('dragover', function(e){
            e.preventDefault();
          });
          card.addEventListener('dragenter', function(e){
            if(draggedTask){
              card.style.backgroundColor = 'rgb(162 170 179)';
            }
          });
          card.addEventListener('dragleave', function(e){
            e.preventDefault();
            if(draggedTask){
              card.style.backgroundColor = 'rgb(235, 235, 235)';
            }
          });
          card.addEventListener('drop', function(e){
            if(draggedTask){
              refToTaskClass.moveToAnotherCard.call(draggedTask, self);
              card.style.backgroundColor = 'rgb(235, 235, 235)';
              draggedTask = null;
            }
          });

          //вешаем слушатель на перетаскивание, чтобы элемент запомнился
          card.addEventListener('dragstart', function(e){
            draggedCard = this;
          });

          //вешаем слушатель на кнопку создать задачу
          buttonAddTask.addEventListener('click', ()=>{
              if(inputTask.value != ""){
                  this.addTask(inputTask.value,taskCollection,card);
                  inputTask.value = "";
              }
          });
          //вешаем слушатель на изменние имени задачи
          h2.addEventListener('click', function clicked(){
            let input = document.createElement('input');
            input.className = 'inputCardTitle';
            input.value = this.innerHTML; //this здесь  заголовок карточки
            this.replaceWith(input);
            input.focus();
            input.addEventListener('blur', function(){
                let h2 = document.createElement('h2');
                h2.innerHTML = this.value; //this здесь тот элемент, который перед .onclick т.е input
                self.title = this.value;
                h2.onclick = clicked;
                input.replaceWith(h2);
              })
            });


        //вешаем слушатель на кнопку удалить карточку
          buttonDeleteTask.addEventListener('click', ()=>{
          //создаем элементы для модалки
          let modalApproveOverlay = document.createElement('div');
          let modalApprove = document.createElement('div');
          let modalP = document.createElement('p');
          let modalYes = document.createElement('button');
          let modalNO = document.createElement('button');
          //заполняем их текстом
          modalP.innerHTML = 'Удалить карточку?';
          modalYes.innerHTML = 'Да';
          modalNO.innerHTML = 'Нет';
          modalApprove.className = 'modalApprove';
          modalApproveOverlay.className = 'modalApproveOverlay';
          //вставляем в DOM
          modalApprove.append(modalP);
          modalApprove.append(modalYes);
          modalApprove.append(modalNO );
          modalApproveOverlay.append(modalApprove);
          self.container.append(modalApproveOverlay);

          //вешаем слушатель на модалку ДА
          modalYes.addEventListener('click', ()=>{
            this.deleteCard(card);
            closeModalApprove(modalApproveOverlay);
          });
          //вешаем слушатель на модалку НЕТ
          modalNO.addEventListener('click', ()=> closeModalApprove(modalApproveOverlay));

          function closeModalApprove(modal){
            modal.remove();
          }

        })
      }
      //удаляем карточку
      deleteCard(card){
        card.remove();
        //здесь мы удаляем задачу из массива CardArray в экземпляре класса Card 
        let i = that.cardArray.indexOf(this);
        // возвращает индекс первого вхождения указанного значения
        that.cardArray.splice(i,1);
        //начиная с позиции i удаляет 1 элемент
      }
    }

    class Task{
      constructor(taskName, container, card, description = "Добавить более подробное описание..", comment = []){
          this.self= this;
          this.container = container;
          this.card = card;
          this.taskmenu = null;
          this.state = {
              text: taskName,
              description: description,
              comments: comment
          }
          this.createTask();
      }
      //создать задачу
      createTask(){
        //создаем саму задачку
          this.task = document.createElement('div');
          this.task.classList.add("task");
          this.task.setAttribute('draggable', 'true');
          //вешаем слушатель на задачку, чтобы она раскрылась
          this.task.addEventListener('click', (e)=>{
            //если цель не кнопка удалить, то показываем меню задачи
              if(e.target != deleteButton){
                  this.showMenu.call(this);
              }
          });
          //вешаем слушатель на перетаскивание, чтобы элемент запомнился
          this.task.addEventListener('dragstart', (e)=>{
            draggedTask = this;
          })

          // заголовок задачки
          this.taskTitle = document.createElement('p');
          this.taskTitle.innerText = this.state.text;
          //кнопка удалить задачку
          let deleteButton = document.createElement('button');
          deleteButton.className = 'btn-close';
          deleteButton.innerText = "X";
          //вешаем слушатель на кнопку удалить
          deleteButton.addEventListener('click', (e)=>{
            e.preventDefault();
            this.deleteTask.call(this);
          });
          //добавляем в DOM элементы
          this.task.append(this.taskTitle);
          this.task.append(deleteButton);
          this.container.append(this.task);
          refToTaskClass = this;
      }
      deleteTask(){
          this.task.remove();
          //здесь мы удаляем задачу из массива CardArray в экземпляре класса Card 
          let i = this.card.taskArray.indexOf(this);
          // возвращает индекс первого вхождения указанного значения
          this.card.taskArray.splice(i,1);
          //начиная с позиции i удаляет 1 элемент
      }
      showMenu(){
        let self = this;
          //создаем элементы для отображения менюшки задачки
          let menu = document.createElement("div");
          let menuContainer = document.createElement("div");
          this.taskmenu = menuContainer;
          let menuTitle = document.createElement("h2");
          let menuDescription = document.createElement("div");
          let descriptionArea = document.createElement("p");
          let commentsInput = document.createElement("input");
          let commentsButton = document.createElement('button');
          let commentsCollection = document.createElement("div");
          let buttonCloseTaskMenu = document.createElement('button');
          let buttonMoveToCard = document.createElement('button');
          let selectCard = document.createElement('select');

          //добавляем этим элементам классы
          menu.className = "menu";
          menuContainer.className = "menuContainer";
          menuTitle.className = "menuTitle";
          menuDescription.className = "menuDescription";
          commentsCollection.className = "commentsCollection";
          commentsInput.className = "commentsInput comment";
          commentsButton.className = "commentsButton btn-save";
          buttonCloseTaskMenu.className = "btn-close-Taskmenu";
          buttonMoveToCard.className = 'btn-move-card btn-save';


          //добавляем внутрь текст
          commentsButton.innerHTML = "Добавить";
          commentsInput.placeholder = "Напишите комментарий..";
          descriptionArea.innerHTML = this.state.description;
          menuTitle.innerHTML = this.state.text;
          buttonCloseTaskMenu.innerHTML = 'X';
          buttonMoveToCard.innerHTML = 'Переместить в';

          //заполняем select опциями наименованиями карточек
          let arrayCard = document.querySelectorAll('.card');
          for (let i = 0; i < arrayCard.length; i++){
            let option = document.createElement('option');
            option.innerHTML = arrayCard[i].children[0].textContent;
            selectCard.append(option);
          }
          //слушатель на кнопку переместить в другую карточку
          buttonMoveToCard.addEventListener('click', () => {
              let selectedItem = selectCard.selectedIndex;
              let options = selectCard.querySelectorAll('option');
              let selectedCard = options[selectedItem].text;
              for (let i = 0; i < that.cardArray.length; i++){
                if (that.cardArray[i].title == selectedCard){
                  this.moveToAnotherCard(that.cardArray[i]);
                  //закрываем окошко таски 
                  this.closeMenuTask(this.taskmenu);
                }
          }
        });
          // //навешиваем слушатель на закрытие меню , если кликнули на элемент с классом menucontainer,(т.е вне меню) то закрываем его
          // menuContainer.addEventListener('click', (e)=>{
          //     if(e.target.classList.contains("menuContainer")){
          //         menuContainer.remove();
          //     }
          // });
          //слушатель на кнопку крестик -  закрыть меню задачи
          buttonCloseTaskMenu.addEventListener('click', (e)=>{
            e.preventDefault();
            this.closeMenuTask(menuContainer);
          });
          //слушатель на кнопку добавить комментарий
          commentsButton.addEventListener('click', (e)=>{
              e.preventDefault();
              if(commentsInput.value != ""){
              this.state.comments.push(commentsInput.value);
              this.renderComments(commentsCollection);
              commentsInput.value = "";
              }
          })
          // слушатель на изменение имени задачи
          menuTitle.addEventListener('click', function clicked(){
            let input = document.createElement('input');
            input.className = 'inputTitle';
            input.value = this.innerHTML; //this здесь  menuTitle 
            this.replaceWith(input);
            input.focus();
            input.addEventListener('blur', function(){
                let h2 = document.createElement('h2');
                h2.className = 'menuTitle';
                h2.innerHTML = this.value; //this здесь тот элемент, который перед .onclick т.е input
                self.state.text = this.value;
                self.card.title = this.value;
                self.taskTitle.innerHTML = this.value;
                h2.onclick = clicked;
                input.replaceWith(h2);
              })
            });
          //слушатель на сохранение описания задачи
          descriptionArea.addEventListener('click', function clickedArea(){
            let descriptionInput = document.createElement("textarea");
            descriptionInput.innerHTML = this.innerHTML;
            this.replaceWith(descriptionInput);
            descriptionInput.focus();
            descriptionInput.addEventListener('blur', function(){
              let descriptionP = document.createElement('p');
              descriptionP.innerHTML = this.value; //this здесь тот элемент, который перед .onclick т.е input
              self.state.description = this.value;
              descriptionP.onclick = clickedArea;
              descriptionInput.replaceWith(descriptionP);
            })
          })

          //добавляем элементы в DOM
          menu.append(menuTitle);
          menu.append(buttonCloseTaskMenu);
          menuDescription.append(descriptionArea);
          menu.append(menuDescription);
          menu.append(commentsInput);
          menu.append(commentsButton);
          menu.append(commentsCollection);
          menu.append(buttonMoveToCard);
          menu.append(selectCard);
          menuContainer.append(menu);
          myModuleContainer.append(menuContainer);

          //отрисовываются комментарии, которые уже были созданы ранее
          this.renderComments(commentsCollection);
      }
      closeMenuTask(menu){
        menu.remove();
      }
      moveToAnotherCard(cardToMove){   
        // отправляем таску в массив нужной карточки
        cardToMove.taskArray.push(this);
        //удаляем из прошлой карточки
        this.deleteTask();
        //отрисовываем в новой
        this.card = cardToMove;
        this.container = cardToMove.taskContainer;
        this.task = null;
        this.createTask.call(this);
      }
      renderComments(commentsCollection){
        //создаем массив из  комментариев , которые есть в контейнере
          let currentCommentsDOM = Array.from(commentsCollection.childNodes);
          // и удаляем комментарии .для того, чтобы они не дублировались со след. операцией
          currentCommentsDOM.forEach(commentDOM =>{
              commentDOM.remove();
          });
          //отрисовываем комментарии из  нашего экземпляра класса
          this.state.comments.forEach(comment =>{
              // new Comment(comment, commentsCollection, this);
              let commentDiv= document.createElement('div');
              commentDiv.className = "comment";
              commentDiv.innerText = comment;
              commentsCollection.append(commentDiv);
          });
      }
    }

 }
 /* -------- end view --------- */
/* ------- begin model ------- */
function ModuleModel () {
    let myModuleView = null;
    let ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
    let stringName='BORISENKO_TRELLO';
    let storage;
    let storagePassword;
    let that = this;
    let timerId = null;

      this.init = function(view) {
        myModuleView = view;
      }
      this.updateState = function() {
        const hashPageName = window.location.hash.slice(1).toLowerCase();
        myModuleView.renderContent(hashPageName);
      }
      this.downloadData = function(login,password){
        $.ajax( {
          url : ajaxHandlerScript,
          type : 'POST', dataType:'json',
          data : { f : 'READ', n : stringName },
          cache : false,
          success : readReady,
          error : this.errorHandler
      })
      function readReady(callresult) {
         // сообщения получены - показывает
        if ( callresult.error != undefined ){
            console.log(callresult.error);
        } else {
          storage=[];
            if ( callresult.result!="" ) { // либо строка пустая - сообщений нет
              // либо в строке - JSON-представление массива сообщений
              storage=JSON.parse(callresult.result);
            }
        }
        let isError = new Set();
        //перебираем полученный распаршенный json и сверяем есть ли такое имя и пользователь, если есть то открываем страницу #main,
        //если нет, то в выводим ошибку
        for(let i = 0; i < storage.length; i++){
          if (storage[i].name == login && storage[i].pas == password){
            window.location.hash = '#main';
            myModuleView.showExistData(storage[i]);
            that.saveInLocalStorage(login,password);
            that.updateDataOnServer(login,password);
            //будем сохранять объект с карточками каждую минуту через метод updateDataOnServer
            isError.add(true);
            break
          } else {
              isError.add(false);
          }
        }
        if(!isError.has(true)){
          myModuleView.showError();
        }
      }
      //если есть , то парсим их и отдаем во view
      }
      this.createUser = function(user, password){
        storagePassword=Math.random();
        $.ajax( {
                url : ajaxHandlerScript,
                type : 'POST', dataType:'json',
                data : { f : 'LOCKGET', n : stringName, p : storagePassword },
                cache : false,
                success : lockGetReady,
                error : this.errorHandler
            }
        );

        function lockGetReady(callresult) {
          if ( callresult.error != undefined){
            console.log(callresult.error);
          } else {
            storage=[];
            if ( callresult.result != "" ) { // либо строка пустая - сообщений нет
              // либо в строке - JSON-представление массива сообщений
              storage=JSON.parse(callresult.result);
            }
            storage.push( { name:user, pas:password } );
            $.ajax({
                    url : ajaxHandlerScript,
                    type : 'POST', dataType:'json',
                    data : { f : 'UPDATE', n : stringName,
                       v : JSON.stringify(storage), p : storagePassword },
                    cache : false,
                    success :this.updateReady,
                    error : this.errorHandler
            });
          }
      } 
      }
      this.createCard = function(cardArea,addCardInput){
        myModuleView.createCard(cardArea,addCardInput); 
      }
      this.errorHandler = function(jqXHR,statusStr,errorStr) {
        console.log(statusStr+' '+errorStr);
      }
      this.updateReady = function(callresult){
        if ( callresult.error != undefined ){
            console.log(callresult.error);
          }
        }
      this.updateDataOnServer = function(user,password){
        if(timerId){
          clearInterval(timerId);
          timerId = setInterval(saveUserObject,60000);
        } else{
          timerId = setInterval(saveUserObject,60000);
        }

        function saveUserObject (){
          let userData = myModuleView.cardArray;
          console.log(userData);
          let newUserData = {};
          //выбираем из массива только неообходимые данные для отправки на сервер
          for(let i = 0; i < userData.length; i++){
            newUserData[i] = {};
            newUserData[i].cardTitle = userData[i].title;
            newUserData[i].taskArray = {};
            for (let n = 0; n < userData[i].taskArray.length; n++){
              newUserData[i].taskArray[n] = {};
              newUserData[i].taskArray[n].taskName = userData[i].taskArray[n].state.text;
              newUserData[i].taskArray[n].description = userData[i].taskArray[n].state.description;
              newUserData[i].taskArray[n].comments = userData[i].taskArray[n].state.comments;
            }
          }

          storagePassword=Math.random();

          $.ajax( {
            url : ajaxHandlerScript,
            type : 'POST', dataType:'json',
            data : { f : 'LOCKGET', n : stringName, p : storagePassword },
            cache : false,
            success : lockGetReadyForSaving,
            error : this.errorHandler
          });

          function lockGetReadyForSaving(callresult) {
            if ( callresult.error != undefined){
              console.log(callresult.error);
            } else {
              storage=[];
              if ( callresult.result != "" ) { // либо строка пустая - сообщений нет
                // либо в строке - JSON-представление массива сообщений
                storage=JSON.parse(callresult.result);
              }
              //ищем в массива имя\пароль , который вернулся с сервера, элемент нужного юзера
              //удаляем его и в массив добавляем обновленный этот элемент с объектом по карточкам
              for(let i = 0; i < storage.length; i++){
                if (storage[i].name == user && storage[i].pas == password){
                  storage.splice(i,1);
                  storage.push( { name:user, pas:password, cards: newUserData } );
                }
              }
              // сохраняем на сервер обновленную строку
              $.ajax({
                      url : ajaxHandlerScript,
                      type : 'POST', dataType:'json',
                      data : { f : 'UPDATE', n : stringName, v : JSON.stringify(storage), p : storagePassword },
                      cache : false,
                      success : this.updateReady,
                      error : this.errorHandler
              });
              //показываем пользователю, что данные обновились
              myModuleView.showUpdatedState();
            }
          } 
        }
      }
      this.drawStatBars = function(){
        myModuleView.drawStatistBars();
      }
      this.showInvalidInput = function(id){
        myModuleView.showInvalidInp(id);
      }
      this.saveInLocalStorage = function(login,password){
        //создаем объект для передачи данных в хранилище
        let user = {};
        user.name = login;
        user.password = password;
        window.localStorage.setItem('userInfo', JSON.stringify(user)); 
      }
      this.dropCard = function(e,cardArea){
        myModuleView.dropCard(e,cardArea);
      }
}
/* -------- end model -------- */
/* ----- begin controller ---- */
function ModuleController () {
    let myModuleContainer = null;
    let myModuleModel = null;
    let self = this;
    let audio = null;

    this.init = function(container, model) {
      myModuleContainer = container;
      myModuleModel = model;

      // вешаем слушателей на событие hashchange и кликам по пунктам меню
      window.addEventListener("hashchange", (e)=>{
        self.updateState();
        if(window.location.hash == '#main'){
          self.updateButtonsBoardZone();
          if ((e.oldURL).indexOf('#stat') > 0 && localStorage.getItem('userInfo')){
            // забираем данные из локального хранилища по юзеру если они есть
            let userDataFromLocStrg = JSON.parse(localStorage.getItem('userInfo'));
            myModuleModel.downloadData(userDataFromLocStrg.name, userDataFromLocStrg.password);
          }
        } else if(window.location.hash == '#stat'){
          self.drawBars();
        }
      });
      //вешаем слушатель на кнопки назад \вперед в браузере
      //и если это главная страница, т.е без хэша, то когда картинка отрендерится, повесятся слушатели на кнопки
      window.addEventListener("popstate", (e)=>{
        if(window.location.hash == ""){
          setTimeout(self.updateButtonsLoginZone, 0);
        } 
      });

      this.updateState(); //первая отрисовка
      this.updateButtonsLoginZone();//вешаем слушатели на кнопки логин окно
      this.updateButtonsBoardZone();
      // при перезагрузе или уходе со страницы  выдавать предупреждение
      window.onbeforeunload = function(e) {
        let dialogText = 'Данные будут утеряны';
        e.returnValue = dialogText;
        return dialogText;
      };
    }
    this.updateState = function() {
      myModuleModel.updateState();
    }
    this.updateButtonsLoginZone = function() {
        //если нажали кнопку "войти"
        let buttonLogIn = document.getElementById("modal-save-exist"); 
        if(buttonLogIn){//если есть такой элемент, то навешиваем слушатель
          buttonLogIn.addEventListener('click', (e)=>{
            self.playAudio();
              let loginInput = document.getElementById("name").value;
              let passwordInput = document.getElementById("password").value;
              //отправляем запрос есть ли данные на сервере
              if(loginInput && passwordInput){
                myModuleModel.downloadData(loginInput,passwordInput);
              } else{
                myModuleModel.showInvalidInput('#modal_login');
              }
          })
        }
        //если нажали кнопку "создать"
        let buttonCreate = document.getElementById("modal-save-new"); 
        if(buttonCreate){ //если есть такой элемент, то навешиваем слушатель
          buttonCreate.addEventListener('click', (e)=>{
            self.playAudio();
            let newUserInput = document.getElementById("name-new").value;
            let newPasswordInput = document.getElementById("password-new").value;
            //отправляем на сервер для создания пользователя
            if(newUserInput && newPasswordInput){
              myModuleModel.createUser(newUserInput,newPasswordInput);
              window.location.hash = '#main';
            } else{
              //покажем ошибку, что пользователь не ввел данные
              myModuleModel.showInvalidInput('#modal_signUp');
            }
          })
        }
    }
    this.updateButtonsBoardZone = function() {
        let addCardButton = document.getElementById("addCardButton");
        let addCardInput = document.getElementById("addCardInput");
        let cardArea = document.getElementById("cardCollection");
      
        if(addCardButton){//если есть такой элемент, то навешиваем слушатель
            addCardButton.addEventListener('click',(e)=>{
            e.preventDefault();
            if (addCardInput.value.trim() != ""){
              myModuleModel.createCard(addCardInput.value)
                addCardInput.value = "";
                }
            });
        }
        if(cardArea){//если есть такой элемент, то навешиваем слушатель
          cardArea.addEventListener('dragover', function(e){
          e.preventDefault();
          
          })
          cardArea.addEventListener('drop', function(e){
            myModuleModel.dropCard(e,cardArea);
          })
      }
    }
    this.drawBars = function(){
      myModuleModel.drawStatBars();
    }
    this.playAudio = function(){
      //если музыка уже запущена, то не будем воспроизводить еще раз
      if (!audio){
        audio = new Audio();
        audio.src = 'music.mp3';
        audio.loop = true;
        audio.autoplay = true;
        audio.volume = 0.3;
      }
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
