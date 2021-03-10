const HomePage = {
    id: "main",
    title: "Страница входа",
    render: () => {
      return `
      <div id = "loginModal">
      <div class="modal" id="modal">
        <header class="modal__header">
          <h2>Вход в Trello</h2>
        </header>
        <main class="modal__content" id="modal_login">
          <div class="form-field">
            <input required class="input__default" type="text" id="name" name="name" placeholder="Введите имя">
          </div>
          <div class="form-field">
            <input required class="input__default" id="password" name="password" placeholder="Введите пароль"> 
          </div>
         <button id="modal-save-exist" class="modal__save" title="Сохранить">Войти в доску</button>
         <p id="errorInput"></p>
        </main>
        <main class="modal__content" id="modal_signUp">
          <p>Зарегистрировать аккаунт</p>
          <div class="form-field">
            <input required class="input__default" type="text" id="name-new" name="name-new" placeholder="Введите имя">
          </div>
          <div class="form-field">
            <input required class="input__default" id="password-new" name="password-new" placeholder="Введите пароль"> 
          </div>
          <button id="modal-save-new" class="modal__save" title="Сохранить">Создать новую доску</button>
          <p id="errorInput"></p>
        </main>
      </div>
  </div>
      `;
    }
  };
  
  const Board = {
    id: "board",
    title: "Доска",
    render: () => {
      return `
        <a href="#stat"><button id = "statBar">Статистика</button></a>
        <div id = "addCard">
            <input id = "addCardInput" class = "comment" placeholder = "Добавить новую карточку">
            <button id = "addCardButton">+</button>
        </div>
        <div id="cardCollection" class="content droppable"></div>
      `;
    }
  };
  
  const Statistics = {
    id: "stat",
    title: "Статистика",
    render: () => {
      return `
        <section id="svg">
        </section>
      `;
    }
  };