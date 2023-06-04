document.addEventListener('DOMContentLoaded', function() {
    var headerContainer = document.createElement('header');

    var nav = document.createElement('nav');
    var ul = document.createElement('ul');

    //ボタン
    var homeButton = createHeaderButton('Home', 'index');
    var madeButton = createHeaderButton('Made', 'made');
    var onBrowserButton = createHeaderButton('OnBrowser', 'onBrowser');
    var otherButton = createHeaderButton('Other','other');

    ul.appendChild(homeButton);
    ul.appendChild(madeButton);
    ul.appendChild(onBrowserButton);
    ul.appendChild(otherButton);

    nav.appendChild(ul);
    headerContainer.appendChild(nav);

    // ページに追加
    document.body.insertBefore(headerContainer, document.body.firstChild);

    // ヘッダーボタンを作成
    function createHeaderButton(text, page) {
        var currentRootPath = window.location.origin;
        //var currentRootPath = "file:///M:/web/";
        var path = currentRootPath+page+".html"
        var button = document.createElement('button');
        button.className = 'header-button';
        button.innerHTML = text;
        button.setAttribute('onclick', "redirectToPage('"+path+"')");
        return button;
    }
});
