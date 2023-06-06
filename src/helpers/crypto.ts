import crypto from "crypto";

const decryptAPI = (encryption: string) => {
  try {
    const decoded = crypto
      .privateDecrypt(
        {
          key: process.env.PRIVATE_KEY as string,
          passphrase: process.env.PASSWORD_DB,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryption, "hex")
      )
      .toString();
    return decoded;
  } catch (error) {
    return false;
  }
};

const decrypt = (encryption: string) => {
  try {
    const cipheredBytes = Buffer.from(encryption, "base64");
    const decoded = crypto
      .privateDecrypt(
        {
          key: process.env.PRIVATE_KEY as string,
          passphrase: process.env.PASSWORD_DB,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        cipheredBytes
      )
      .toString();
    return decoded;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const encrypt = (text: string) => {
  try {
    const encrypted = crypto.publicEncrypt(
      {
        key: process.env.PUBLIC_KEY as string,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(text)
    );
    return encrypted.toString("base64");
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { decrypt, encrypt };
