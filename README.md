# IPMT Curriculum Map

## 工作日誌 (Developer's Note)
這是系辦工讀處理的科管院學士班課程地圖。
若要維護或修改網站內容，以下是「環境建置資訊」與「給 AI 的開發介紹」。
當你需要機器人協助時，可以將README整份丟給它，能確保機器人了解檔案架構跟網頁功能。

另外，如果你只是要小幅度的更改課程內容（ex:把三學分改為兩學分、必修改為選修等），
請打開2.json，善用 Ctrl + F 找到需要更改的資料即可。

*如果程式能跑就不要動它*

---
## 環境建置與執行
請下載zip並解壓縮
在開始修改程式碼之前，請確保你的電腦已經安裝了 Node.js。
1. 安裝環境：請前往 [Node.js 官網](https://nodejs.org/) 下載並安裝 LTS 版本。
*(Optional)安裝VsCode*：如果想要更方便作業，可以安裝VsCode，以VsCode開啟可以更方便編譯
2. 安裝套件：在正確的資料夾開啟終端機，輸入 `npm install`。
*若顯示npm : 因為這個系統上已停用指令碼執行...*：請輸入`Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`並再試一次
3. 啟動開發伺服器：輸入 `npm run dev`，並點擊終端機顯示的網址（通常為 http://localhost:5173/）即可在瀏覽器預覽。

完成修改後，若想要發佈公開網站：
1. 安裝 Vercel 工具：在終端機輸入 `npm install -g vercel`。
2. 執行部署：在專案根目錄下輸入 `vercel`。過程中若系統詢問相關設定，直接按下 **Enter** 使用預設值即可。
3. 取得公開網址：部署完成後，終端機會顯示一個 **「Preview URL」**，這就是你的網頁公開連結。
4. 正式發佈：若你確認網頁內容無誤，想要推送至正式環境，請輸入 `vercel --prod`。


---

## AI Development Guide

### Overview
An interactive curriculum planning tool for NTHU IPMT students to visualize prerequisites and track credits.

* **Visual Curriculum Map**: A clear timeline-based layout showing the entire curriculum structure from freshman to senior year.
* **Interactive Hover Effects**: Hover over any course card to instantly view details, prerequisite requirements, and dependency connections.
* **Sidebar**: Provides essential resources, including navigation links, legend icons, and a real-time "Credit Summary" that automatically calculates your progress based on your selected specialties.
* **Downloadable Maps**: Export your current curriculum configuration as a PNG file for easy reference or consultation with faculty advisors.
* **Dynamic Specialty Switching**: Seamlessly toggle between different dual-specialty combinations using the top navigation menu, with the system automatically filtering relevant courses.

### Project Architecture

The project is built with React (Vite) and Tailwind CSS.

IPMT_Curriculum_Map/
├── .bolt/                # AI 開發環境輔助設定檔
├── .vs/                  # VS Code 專案設定檔
├── node_modules/         # 專案相依套件庫 (無需手動修改)
├── public/               # 靜態資源 (圖示、圖片)
├── src/                  # 核心原始碼 **主要修改都在這邊的資料夾**
│   ├── components/       　　# 介面組件 (UI Components)
│   │   ├── CourseCard.tsx　　　　# 課程卡相關功能
│   │   ├── CurriculumGrid.tsx   # 主要介面、課程排版、互動效果與先修課關聯顯示。
│   │   ├── Navbar.tsx           # 網站導覽列，第一／第二專長切換選單與圖片下載功能。
│   │   └── Sidebar.tsx          # 右側資訊欄相關功能
│   ├── curriculum/       　　# 資料層 (Data Layer)
│   │   ├── 2.json        　　　　# 課程資料 **課程資訊請修改這個檔案**
│   │   ├── data.ts       　　　　# 資料處理邏輯 **選修課程公告連結請修改這個檔案**
│   │   └── rawData.ts    　　　　# 原始資料處理
│   ├── App.tsx           # Core Layout（包含網頁頁底）
│   ├── index.css         # 全域樣式
│   ├── main.tsx          # 進入點
│   └── vite-env.d.ts     # 環境宣告
├── .gitignore            # Git 忽略清單 (設定不推上 GitHub 的檔案)
├── package.json          # 專案相依套件與腳本設定
├── tailwind.config.js    # Tailwind CSS 樣式設定
├── vite.config.ts        # Vite 建置設定
└── README.md             

- **`src/` (Core Framework / 核心架構)**
    - `App.tsx`: The main "brain" of the app; defines page layout.
    - `index.css`: Global styles and colors.
    - `main.tsx`: Entry point for the application.
    - `vite-env.d.ts`: Vite environment definitions.

- **`src/curriculum/` (Data Layer / 資料層)**
    - `2.json`: Primary curriculum data. For most curriculum updates (course names, credits, required/elective status, semester arrangement, prerequisites, etc.), edit this file only.
    - `data.ts` & `rawData.ts`: Internal data processing logic. Normally there is **no need to modify these files** unless you are changing how the application processes curriculum data.

- **`src/components/` (UI Components / 介面層)**
    - `Sidebar.tsx`: Sidebar information, links, and stats.
    - `CurriculumGrid.tsx`: Main layout.
    - `CourseCard.tsx`: Course card styling.

### Common Modification Tasks

#### 1. Updating Links or Text (更新連結或文字)

- **File**: `src/components/Sidebar.tsx`
- **Goal**: Find the section "選課與修課指引" and update the `<a>` tags.

#### 2. Changing Colors or Styles (調整顏色或樣式)

- **Files**: `src\curriculum\data.ts`
- **Goal**: Modify Color (e.g., `bg-red-100`, `text-slate-700`).

#### 3. Updating Course Data (更新課程資料)

- **File**: `src/curriculum/2.json`
- **Goal**: Update course names, credits, required/elective status, semesters, prerequisites, or other curriculum information. In most cases, this is the **only file you need to edit**.


### 其他常見Bug

#### 有顯示擋修X門，但沒有顯示擋修箭頭

->試著把JSON檔中的擋修課程，同時放在"suggestedPrerequisites"、"requiredPrerequisites"，不要只有放在requiredPrerequisites！
->或檢查課名是否完全一致（ex: 如果把微積分B一寫成微積分一，就不會跑出箭頭喔！）

#### 左上角網頁圖片跑不出來

->檢查public資料夾中的icon.jpg是否可以正常開啟，或直接更換新的圖片
->檢查code中是否有檔名誤植


---

*Disclaimer: This tool is for personal planning assistance only. Please refer to official NTHU academic regulations.*