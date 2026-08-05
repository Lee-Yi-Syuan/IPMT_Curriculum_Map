// src/curriculum/specialtyRequirements.ts

export interface SpecialtyReq {
  name: string;            // 專長名稱
  type: '一專' | '二專';    // 專長類別
  requiredCredits: number; // 最少必修學分
  electiveCredits: number; // 最少選修學分
  note?: string;
}

export const UNIVERSITY_REQUIRED_CREDITS = 30; // 校定必修 30 學分
export const COLLEGE_REQUIRED_CREDITS = 21; // 院訂必修 21 學分

export const SPECIALTY_REQUIREMENTS: Record<string, SpecialtyReq> = {
  // ==================== 第一專長 ====================
  '計量財務金融_一專': {
    name: '計量財務金融',
    type: '一專',
    requiredCredits: 26,
    electiveCredits: 9,
  },
  '經濟_一專': {
    name: '經濟',
    type: '一專',
    requiredCredits: 33,
    electiveCredits: 3,
  },
  '法律_一專': {
    name: '法律',
    type: '一專',
    requiredCredits: 25,
    electiveCredits: 11,
  },
  '管理_一專': {
    name: '管理',
    type: '一專',
    requiredCredits: 15,
    electiveCredits: 21,
  },

  // ==================== 第二專長 (依據 PDF PDF 規範) ====================
  '資訊工程_二專': {
    name: '資訊工程',
    type: '二專',
    requiredCredits: 27,
    electiveCredits: 0,
  },
  '動力機械工程_二專': {
    name: '動力機械工程',
    type: '二專',
    requiredCredits: 33,
    electiveCredits: 0,
  },
  '數據科學_二專': {
    name: '數據科學',
    type: '二專',
    requiredCredits: 12,
    electiveCredits: 15,
  },
  '材料科學工程_二專': {
    name: '材料科學工程',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 6,
  },
  '電機工程_二專': {
    name: '電機工程',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 12,
  },
  '工業工程與工程管理_二專': {
    name: '工業工程與工程管理',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 9,
  },
  '哲學_二專': {
    name: '哲學',
    type: '二專',
    requiredCredits: 9,
    electiveCredits: 21,
  },
  '外國語文_二專': {
    name: '外國語文',
    type: '二專',
    requiredCredits: 22,
    electiveCredits: 9,
  },
  '生醫工程_二專': {
    name: '生醫工程',
    type: '二專',
    requiredCredits: 17,
    electiveCredits: 15,
  },
  '環境科技_二專': {
    name: '環境科技',
    type: '二專',
    requiredCredits: 12,
    electiveCredits: 21,
  },
  '社會學_二專': {
    name: '社會學',
    type: '二專',
    requiredCredits: 18,
    electiveCredits: 12,
  },
  '化學_二專': {
    name: '化學',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 8,
  },
  '歷史_二專': {
    name: '歷史',
    type: '二專',
    requiredCredits: 15,
    electiveCredits: 15,
  },
  '心理學_二專': {
    name: '心理學',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 9,
  },
  '人力資源管理_二專': {
    name: '人力資源管理',
    type: '二專',
    requiredCredits: 3,
    electiveCredits: 27,
  },
  '經濟_二專': {
    name: '經濟',
    type: '二專',
    requiredCredits: 30,
    electiveCredits: 3,
  },
  '計量財務金融_二專': {
    name: '計量財務金融',
    type: '二專',
    requiredCredits: 21,
    electiveCredits: 12,
  },
  '法律_二專': {
    name: '法律',
    type: '二專',
    requiredCredits: 22,
    electiveCredits: 11,
  },
  '運動科學_二專': {
    name: '運動科學',
    type: '二專',
    requiredCredits: 18,
    electiveCredits: 12,
  },
  '人類學_二專': {
    name: '人類學',
    type: '二專',
    requiredCredits: 15,
    electiveCredits: 15,
  },
  '數學_二專': {
    name: '數學',
    type: '二專',
    requiredCredits: 20,
    electiveCredits: 6,
  },
  '科技藝術_二專': {
    name: '科技藝術',
    type: '二專',
    requiredCredits: 0,
    electiveCredits: 33,
  },
  '文學與創作_二專': {
    name: '文學與創作',
    type: '二專',
    requiredCredits: 9,
    electiveCredits: 21,
  },
};