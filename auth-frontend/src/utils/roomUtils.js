
const generateRoomId = (email1, email2) => {
  return [email1.toLowerCase().trim(), email2.toLowerCase().trim()]
    .sort()
    .join("_");
};

export default generateRoomId;
