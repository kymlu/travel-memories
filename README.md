# TRAVEL MEMORIES
This project showcases my travels around different countries, namely Japan, Taiwan, Australia, and New Zealand. In August 2022, I temporarily moved to Japan to participate in a study abroad term. After completing the term, I decided to travel around Japan first and later travel to different countries before returning home. 

Users can:
- View pictures I took in each country on national and regional levels,
- Filter my favourite images, and
- Filter images based on keywords, location, and tags.

Thank you to mom, dad, Benson, Ricky, Kazu, and other friends for helping me refine the site's design and squash bugs.

The site: https://kymlu.github.io/travel-memories/

## Code
The code is written in **Javascript**, **HTML**, and **CSS**. I also use a **JSON** file to store my data. I wanted to use ReactJS, Handlebars, and exif-js among other libraries, but I had difficulty installing npm on my laptop. As a result, my code only uses vanilla Javascript.

Since I couldn't use exif-js, I utilized **ExifTool by Phil Harvey** to extract the metadata of each individual picture I uploaded. I also employed **Microsoft Excel** macros to reformat the extracted data, enter captions and additional data, and format the required data into JSON. The resizing and compressing of images was done in **Pixillion**.

The site is optimized for both mobile and web environments. I implemented dynamic and lazy loading of images using an intersection observer to minimize the data load on the user's device.

Note that there are at least 500 more commits than necessary because the beginning of development was done on Github web on my iPad.

### Code Updates
July 2024 - Refactored the site to use components.

## Design
The website was initially creately only for pictures from the Japan portion of the trip. My design always included the map of Japan with the highlighted regions. The English and Japanese bilingual text is also intentional since the pictures were from Japan. However, I quickly realized that I wanted to show others my pictures from the other countries too, so adding the pictures from the other countries would streamline the presentation.

I was inspired by my friend Amy to make each picture displayed in a polaroid-style frame. In our last week at our dorm, our friend group used up the 50+ polaroids she'd brought to take final pictures together.

For the website font, I used **Zen Maru Gothic**, which gave a slightly handwritten and more personal feel. It also supports Japanese characters, which was helpful. I used **Font Awesome** for most icons.

## Final Thoughts
Thank you for looking at my project! I hope you enjoyed perusing my photos and got some inspiration for future travel or websites. If you have any questions, please feel free to contact me!

# 旅行の思い出
このプロジェクトは日本、台湾、オーストラリアとニュージーランドの旅の写真を紹介するためもの。2022年8月に一時的に日本に引っ越して、交換留学に参加しました。留学終わった後、日本を旅行し、他の国々も訪れました。

ユーザーは以下のことができます：
- 各国と各地域で撮った写真を閲覧すること
- 私のお気に入りの写真をフィルターすること
- キーワードや写真の情報でフィルタリングすること

このサイトのデザインと修正に協力してくれた母、父、ベンソン、リッキー、かず、他の友達に深く感謝します。

サイト: https://kymlu.github.io/travel-memories/

## コード
このサイトは**Javascript**、**HTML**と**CSS**で書かれています。データは**JSON**ファイルに保存されていました。ReactJS、Handlebars、exif-jsなどのライブラリを使用したかったのですが、なぜか自分のパソコンにnpmのインストールできませんでした。そのため、バニラJavascriptで挑戦して書きました。

exif-jsを使用できなかったため、**ExifTool by Phil Harvey**を使用して各写真のメタデータを抽出しました。また、**Microsoft Excel**のマクロを使用してそのデータを再フォーマットし、キャプションやその他の情報を追加し、JSON形式に成形しました。写真のリサイズと圧縮は**Pixillion**を使用しました。

このサイトは、モバイルとウェブの環境の両方に最適化されています。最適化のため、ダイナミックローディング遅延読み込みを使用します。

このリポジトリのコミットが必要以上に500以上です。これは、開発の始まりがiPadでGithubのウェブインターフェースに行いました。

###コードのアップデート
２０２４年７月　ー　コンポーネントの使用するためのリファクタリング

## デザイン
最初はウェブサイトは日本の写真のみを表示するために作成されました。訪れた都道府県をハイライトに表示したかったです。また、私が日本で留学したため、全部が英語と日本語のバイリンガルにしたかったです。他の国の写真も友達に見せたかったので、その写真も追加して、統一しました。

友達のエイミーからのインスピレーションで、写真がポラロイドの風にしました。留学の最後の何日は彼女のインスタントカメラで友達の写真をいっぱい撮って、日本に持ってきたポラロイドを使い切れました。

ウェブサイトのフォントが**Zen Maru Gothic**を使用しました。手書きの感じをし、個人的な印象を与えます。日本の文字もできて便利です。アイコンは大体**Font Awesome**を使用しました。

## 最後
このプロジェクトをご覧いただき、ありがとうございます。旅行やウェブサイトのプロジェクトにインスピレーションを受けたことができたでしょうか。質問ありましたら、遠慮なくお連絡してください！
