export const regPattern = [
  {
    name: /^(?=.{1,50}$)[a-zA-Z]+(?:['_.^\s][a-zA-Z]+)*$/i,
    email: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
    phone: /^([0|\\+[0-9]{1,5})?([1-9][0-9]{9})$/i
  },
];
