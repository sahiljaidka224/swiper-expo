import xml2js from "react-native-xml2js";

const parseStringPromise = (xml: string) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

export default parseStringPromise;
