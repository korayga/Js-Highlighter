
# JavaScript Parser & Syntax Highlighter

🚀 **JavaScript Syntax Highlighter** - Gerçek zamanlı JavaScript sözdizimi analizi ve görselleştirme aracı

### 🎥 Detaylı anlatım videosunu izlemek isterseniz YouTube adresim : https://www.youtube.com/watch?v=rmUQEf1frwY

##  Özellikler

| Özellik                          | Açıklama                                                                 |
|----------------------------------|--------------------------------------------------------------------------|
| 🎨 Sözdizimi Vurgulama           | Gerçek zamanlı, renkli vurgulama ile görsel destekli düzenleme          |
| 🔍 Lexical Analiz                | Regex tabanlı token çözümleyici (KEYWORD, IDENTIFIER, STRING, vs.)     |
| 🌲 Abstract Syntax Tree (AST)    | Dilbilgisine göre yapılandırılmış analiz ağacı                          |
| 🧠 Grammar Kuralları             | Bağlamdan bağımsız, açık biçimde tanımlanmış CFG                         |
| 📊 İstatistik Paneli             | Token sayımı, hata raporu ve analiz sonuçları anlık görünür             |
| 🧪 Hata Yakalama                 | Gerçek zamanlı sözdizimi hatası algılama ve bildirim sistemi            |
| 💻 GUI Editör                    | HTML + CSS + JavaScript ile geliştirilen dinamik, responsive editör     |

---

![Image](https://github.com/user-attachments/assets/05e13fc9-6183-4c80-aac8-7c3e71a9fdbd)

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Modern web tarayıcısı (Chrome, Firefox, Safari, Edge)
- HTTP sunucu (CORS kısıtlamaları için)

### Kurulum

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/korayga/js-highlighter.git
cd js-highlighter
```

2. **HTTP sunucu başlatın:**
```bash
# Python 3 ile
python -m http.server 8000


# Live Server (VS Code extension) ile
# index.html dosyasına sağ tıklayıp "Open with Live Server"
```

3. **Tarayıcıda açın:**
```
http://localhost:8000/index.html
```

## 📁 Proje Yapısı

```
js-parser-highlighter/
├── index.html            # Ana HTML dosyası
├── style.css             # Stil dosyası
├── js/
│   ├── main.js          # Ana uygulama mantığı
│   ├── Lexer.js         # Lexical analyzer
│   ├── Parser.js        # Syntax parser
│   ├── Highlighter.js   # Syntax highlighter
│   └── ASTVisualizer.js # AST görselleştirici
└── README.md            
```

## 🔧 Teknik Detaylar

---

### * Lexer (Sözcüksel Analiz) *

**-- Token Türleri --**  
Lexer, kaynak kodu anlamlı birimlere (tokenlara) ayırır. Tanımlanan başlıca türler:

- `KEYWORD` → `if`, `let`, `function`, `switch`, `return`, vb.  
- `IDENTIFIER` → Değişken ve fonksiyon adları  
- `NUMBER` → Tam sayılar, ondalık, hex/binary (örn. `42`, `0xFF`, `3.14`)  
- `STRING` → `"çift tırnak"`, `'tek tırnak'`, `` `template` ``  
- `OPERATOR` → `+`, `-`, `*`, `=`, `==`, `===`, `!==`, `<`, `>`, vb.  
- `PUNCTUATION` → `{}`, `()`, `[]`, `,`, `;`, `:` gibi yapısal karakterler  
- `COMMENT` → `// tek satır`, `/* çoklu yorum */`  
- `UNKNOWN` → Tanınmayan ya da hatalı karakterler

**-- Regex Tabanlı Yaklaşım --**  
Her token, belirli bir RegEx ile tanımlanır. Sıra önemlidir: çok karakterli operatorler (`===`) önce gelmelidir.

Örnek:
```js
{ type: 'KEYWORD', regex: /^\b(let|const|if|else|return)\b/ }
{ type: 'OPERATOR', regex: /^(\+\+|--|===|!==|==|!=|<=|>=|=|\+|\-)/ }
{ type: 'NUMBER', regex: /^\d+(\.\d+)?/ }
```

**-- Konum Takibi --**  
Her token’a şu bilgiler atanır:
- Satır (`line`) ve sütun (`column`)
- Başlangıç-bitiş index’i (`start`, `end`)
- Karakter uzunluğu

**-- Hata Toleransı --**  
Tanımsız karakterler `"UNKNOWN"` türüyle işaretlenir ve analiz durmaz. Bu, **hatalı kodu da** tokenize edebilme imkanı sağlar.

---

### * Parser (Sözdizimi Analizi) *

**-- Recursive Descent Parser --**  
Parser, top-down (yukarıdan aşağı) ve **özyinelemeli (recursive)** bir yaklaşımla çalışır.  
Her yapı (`if`, `while`, `function`, `switch`) için ayrı `parseX()` fonksiyonları vardır.

Örnek:
```js
parseIfStatement() {
  consumeToken('KEYWORD'); // 'if'
  consumeToken('PUNCTUATION'); // '('
  const test = parseExpression();
  consumeToken('PUNCTUATION'); // ')'
  const body = parseStatement();
  return { type: "IfStatement", test, body };
}
```

**-- JavaScript Dilbilgisi (Grammar) --**  
EBNF yapısı ile desteklenen üretim kuralları:
```ebnf
IfStatement ::= "if" "(" Expression ")" Statement ("else" Statement)?
FunctionDeclaration ::= "function" IDENTIFIER "(" ParameterList? ")" Block
SwitchStatement ::= "switch" "(" Expression ")" "{" CaseBlock "}"
```

**-- AST (Abstract Syntax Tree) --**  
Kod yapılarının ağaç biçimli temsili. Örnek:
```
IfStatement
├── test: x > 5
└── consequent:
    └── ReturnStatement: x
```

**-- Hata Kurtarma (Error Recovery) --**  
Parser hata durumunda durmaz:  
- `addError()` ile hata listesine kayıt ekler  
- Sonraki yapı için **devam eder**  


### Desteklenen JavaScript Yapıları

#### ✅ Değişken Tanımlamaları
```javascript
let x = 10;
const pi = 3.14;
var user = "korayga";
```

#### ✅ Fonksiyonlar
```javascript
function greet(user) {
    return "Hello " + user;
}
```

#### ✅ Kontrol Yapıları
```javascript
// If-else
if (x > 0) {
    console.log("Positive");
} else {
    console.log("Not positive");
}

// Switch-case
switch (value) {
    case 1: break;
    default: break;
}

// Döngüler
for (let i = 0; i < 10; i++) { }
while (condition) { }
do { } while (condition);
```

#### ✅ Try-Catch
```javascript
try {
    riskyOperation();
} catch (error) {
    handleError(error);
}
```

#### ✅ Veri Yapıları
```javascript
const array = [1, 2, 3];
const object = { a: 1, b: 2 };
```

## 🎯 Kullanım

1. **Kod Yazma**: Sol paneldeki editöre JavaScript kodunuzu yazın
2. **Analiz Görme**: Yazarken otomatik olarak analiz sonuçları güncellenir
3. **Tokenları İnceleme**: "Tokenlar" sekmesinde lexical analiz sonuçlarını görün
4. **Parse Tree**: "Parse Tree" sekmesinde AST görselleştirmesini inceleyin
5. **Hatalar**: "Hatalar" sekmesinde sözdizimi hatalarını kontrol edin

## ⚙️ Konfigürasyon

### Token Renkleri (style.css)
```css
.token-KEYWORD { color: #f92672; }     /* Anahtar kelimeler */
.token-IDENTIFIER { color: #a6e22e; }  /* Değişken isimleri */
.token-NUMBER { color: #ae81ff; }      /* Sayılar */
.token-STRING { color: #e6db74; }      /* Metinler */
```

### Grammar Kuralları (Parser.js)
```javascript
this.grammar = {
    'Program': ['Statement*'],
    'Statement': ['VarDeclaration', 'FunctionDeclaration', 'IfStatement'],
    // ... diğer kurallar
};
```


### Geliştirme Rehberi

#### Yeni Token Türü Ekleme:
```javascript
// Lexer.js içinde
{ type: 'NEW_TOKEN', regex: /^pattern/, ignore: false }
```

#### Yeni Grammar Kuralı Ekleme:
```javascript
// Parser.js içinde
parseNewStatement() {
    // Implementation
}
```

## 📈 Performance

- **Debounced Updates**: 200ms gecikme ile gereksiz işlem önlenir
- **Selective Parsing**: Sadece değişen kısımlar yeniden analiz edilir
- **Memory Efficient**: Token ve AST optimizasyonu


## Geliştirici

- **Email**: koraygarip3@gmail.com
- **GitHub**: [@korayga](https://github.com/korayga)

---

