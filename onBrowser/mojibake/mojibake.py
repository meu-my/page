#janken2.htmlとjanken.pyが存在するディレクトリで、簡易的なHTTPサーバーを起動すると解決します。
#コマンドラインで以下のようにpython3 -m http.serverを実行してHTTPサーバーを起動します
#それからhttp://localhost:8000/janken2.htmlにアクセス
#テストを行う場合

import html

def text_garbled():
    now_div = Element("inputText1")
    text = now_div.element.value
    
    text = text.encode('utf-8', 'replace').decode('shift_jis', 'replace')
    text = html.escape(text)

    now_div = Element("inputText2")
    now_div.element.value = escape_html(text)


def text_repair():
    now_div = Element("inputText2")
    text = now_div.element.value
    
    text = text.encode('shift_jis', 'replace').decode('utf-8', 'replace')

    now_div = Element("outputText")
    now_div.element.value  = escape_html(text)


def escape_html(input):
    return html.escape(input)