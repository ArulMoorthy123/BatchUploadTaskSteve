import { environment } from "src/environments/environment"

export const CONFIG = {
  MESIBO_ACCESS_TOKEN: "c95hdzc18szu82uz53ng52js1le6i6yzz9coomfonciabrpgk4jy1y7iy9l3ry22",
  //c95hdzc18szu82uz53ng52js1le6i6yzz9coomfonciabrpgk4jy1y7iy9l3ry22
  //MESIBO_ACCESS_TOKEN :"mozsuf408dx1cfu3e2dvr7rli7akit40azl21e0mb81nvskmh8curz3i4sjunboh",
  MESIBO_APP_NAME: "qa",
  MESIBO_APP_ID :12504,
  MESIBO_API_URL: " https://api.mesibo.com/api.php",
  MESIBO_DOWNLOAD_URL: "https://appimages.mesibo.com/",
  MESIBO_UPLOAD_URL: "https://s3.mesibo.com/api.php",
  LINK_PREVIEW_URL: "https://austin92jus.000webhostapp.com/backend/urlDetails.php"
}

export const CONSATNT = {
  MAX_MESSAGES_READ_SUMMARY : 100,
  MAX_MESSAGES_READ  :100,
}

export const MESSAGE_TYEPE = {
  GROUP_CREATE : 1,
  GROUP_UPDATE : 2,
  LEFT_PARTICIPANT : 3,
  ADD_NEW_PARTICIPANT : 4,
  DELETE_GROUP :5,
  UPDATE_GROUP : 6,
  NOTIFY_TYPING : 7,
  NOTIFY_ONLINE :8
}