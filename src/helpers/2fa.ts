import { status2faFn, validarCode2fa } from "../controllers/2fa.controller";

const validation2FA = async (defixId: string, code: string | undefined) => {
  try {
    const status = await status2faFn(defixId);

    if (!status) return true;

    if (!code) return false;

    const validate = await validarCode2fa(code, defixId);

    if (!validate) return false;

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { validation2FA };
