export const isEmail = (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$/i.test(email);

export const isObjectEmpty = (objectName) => Object.keys(objectName).length === 0;

export const logger = (caller, message) => console.log(caller + " -> " + message);

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const openModal = (name) => {
  let modalElement = document.getElementById(name);
  let modal = bootstrap.Modal.getOrCreateInstance(modalElement, { backdrop: "static", focus: false, keyboard: false });
  modal.show();
};

export const closeModal = (name) => {
  let modalElement = document.getElementById(name);
  let modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
};

export const openOffCanvas = (name) => {
  let offcanvasElement = document.getElementById(name);
  let offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement, { backdrop: "static", focus: false, keyboard: false });
  offcanvas.show();
};

export const closeOffCanvas = (name) => {
  let offcanvasElement = document.getElementById(name);
  let offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
  offcanvas.hide();
};

export const parseSubject = (subject, data) => {
  if (subject.includes("[FIRST_NAME") && data.name) {
    const { firstName } = splitName(data.name);
    subject = subject.replace("[FIRST_NAME]", firstName);
  }

  if (subject.includes("[LAST_NAME") && data.name) {
    const { lastName } = splitName(data.name);
    subject = subject.replace("[LAST_NAME]", lastName);
  }

  if (subject.includes("[EMAIL]")) {
    subject = subject.replace("[EMAIL]", data.email);
  }

  if (subject.includes("[COMPANY]") && data.company) {
    subject = subject.replace("[COMPANY]", data.company);
  }
  
  return subject;
};

export const parseContent = (content, data) => {
  if (content.includes("[FIRST_NAME") && data.name) {
    const { firstName } = splitName(data.name);
    content = content.replace("[FIRST_NAME]", firstName);
  }

  if (content.includes("[LAST_NAME") && data.name) {
    const { lastName } = splitName(data.name);
    content = content.replace("[LAST_NAME]", lastName);
  }

  if (content.includes("[EMAIL]")) {
    content = content.replace("[EMAIL]", data.email);
  }

  if (content.includes("[COMPANY]") && data.company) {
    content = content.replace("[COMPANY]", data.company);
  }

  return content;
};

export const splitName = (fullName) => {
  if (!fullName) {
    return { firstName: "", lastName: "" };
  }

  const nameParts = fullName.split(" ");

  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ") || "";
  return { firstName, lastName };
};

export const getFileExtension = (file) => {
  return file.name.split(".").pop();
};

export const cleanHtml = (html) => {
  const regex = /<p[^>]*data-f-id="pbf"[^>]*>.*?<\/p>/i;
  return html.replace(regex, "");
};
