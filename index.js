const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const bgProgress = document.querySelector(".bg-progress");
const percentNum = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURL = document.querySelector("#fileURL");
const sharingContainer = document.querySelector(".sharing-container");
const copyIcon = document.querySelector("#copyIcon");
const emailForm = document.querySelector("#email-form");
const toast = document.querySelector(".toast");
const maxAllowedsize = 100 * 1024 * 1024;
const host = "https://innshare.herokuapp.com/";
const uploadURL = "${host}api/files";
const emailURL = "${host}api/files/send";
// const uploadURL = "${host}api/files";

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
  }
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
});

const uploadFile = () => {
  if (fileInput.files.length > 1) {
    resetFile();
    showToast("only 1 file allowed!");
    return;
  }
  const file = fileInput.files[0];
  if (file.size > maxAllowedsize) {
    showToast("only 100MB size is allowed");
    resetFile();
    return;
  }
  progressContainer.style.display = "block";
  const formData = new FormData();
  formData.append("myfile", file);

  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      onUploadSuccess(JSON.parse(xhr.response));
    }
  };

  xhr.upload.onprogress = updateProgress;
  xhr.upload.onerror = () => {
    resetFile();
    showToast(`Error in upload:${xhr.statusText}`);
  };

  xhr.open("OPEN", uploadURL);
  xhr.send(formData);
};
const updateProgress = (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  bgProgress.style.transform = "${percent}%";
  percentNum.innerText = percent;
  progressBar.style.transform = "scaleX(${percent/100})";
};

const onUploadSuccess = ({ file: url }) => {
  resetFile();
  emailForm[2].removeAttribute("disabled");
  progressContainer.style.display = "none";
  sharingContainer.style.display = "block";
  fileURL.value = url;
};
const resetFile = () => {
  fileInput.value = "";
};
copyIcon.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Link Copied");
});

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const url = fileURL.value;
  const formData = {
    uuid: url.split("/").splice(-1, 1)[0],
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };
  emailForm[2].setAttribute("disabled", "true");

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then(({ success }) => {
      if (success) {
        sharingContainer.style.display = "none";
        showToast("Email Sent");
      }
    });
});
let toastTimeout;
const showToast = (msg) => {
  toast.innerText = msg;
  toast.style.transform = "translate(-50%,0)";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.transform = "translate(-50%,60px)";
  }, 2000);
};
