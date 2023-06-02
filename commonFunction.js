//共通機能一覧

//指定ページに移動
function redirectToPage(url) {
      window.location.href = url;
  }

function header(){
    $.ajax({
        url: "header.html",
        cache: false,
        success: function(html){
            document.write(html);
        }
    });
}