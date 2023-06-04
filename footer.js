document.addEventListener('DOMContentLoaded', function() {
    var footerContainer = document.createElement('footer');

    var icon_row = document.createElement('div');
    icon_row.className = "icon_row"
    
    //リンクテキスト
    var footer_text = document.createElement('div');
    footer_text.className = "footer_text"
    var footer_text_txt = document.createElement('a');
    footer_text_txt.innerHTML = "Link"
    footer_text.appendChild(footer_text_txt);

    //アイコン
    var twitter_icon = createLinkIcon('twitter_icon', 'twitter.com/meu_my_');
    var youtube_icon = createLinkIcon('youtube_icon', 'youtube.com/@meu_my');

    //コピーライト
    var footer_copylight = document.createElement('div');
    footer_copylight.className = "footer_copylight"
    var footer_copylight_txt = document.createElement('a');
    footer_copylight_txt.innerHTML = "© 2023 Meu"
    footer_copylight.appendChild(footer_copylight_txt);

    icon_row.appendChild(footer_text);
    icon_row.appendChild(twitter_icon);
    icon_row.appendChild(youtube_icon);
    icon_row.appendChild(footer_copylight);

    footerContainer.appendChild(icon_row);
    // ページに追加
    document.body.insertBefore(footerContainer, document.body.firstChild);

    // アイコンを作成
    function createLinkIcon(img, page) {
        var currentRootPath = "https://meu-my.github.io/page/"
        //var currentRootPath = "file:///M:/web/";
        var pagePath = "https://"+page
        var imgPath = currentRootPath+"link_icon/"+img+".png"

        var icon = document.createElement('div');
        icon.className = 'icon';
        icon.setAttribute('onclick', "redirectToPage('"+pagePath+"')");

        var img = document.createElement('img');
        img.setAttribute('src', imgPath);

        icon.appendChild(img);
        return icon;
    }
});
