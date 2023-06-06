import nodemailer from "nodemailer";
import path from "path";
import hbs, {
  NodemailerExpressHandlebarsOptions,
} from "nodemailer-express-handlebars";
import { User } from "../entities/user.entity";

async function EnvioCorreo(from: any, to: any, type: any, data: any) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.PASS_MAIL,
    },
  });

  let from_admin = process.env.USER_MAIL;

  // point to the template folder
  const handlebarOptions: NodemailerExpressHandlebarsOptions = {
    viewEngine: {
      partialsDir: path.resolve("./src/views_email/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/views_email/"),
  };
  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  switch (type) {
    case "envio":
      {
        if (from != null) {
          // Envio al emisor
          let tipoEnvio = "";
          switch (data.tipoEnvio) {
            case "user":
              tipoEnvio = "al usuario";
              break;
            case "wallet":
              tipoEnvio = "a la siguiente dirección";
              break;
          }
          if (tipoEnvio != "") {
            const mailOptionsFrom = {
              from: from_admin,
              to: from,
              subject: "Envio de fondos",
              template: "EnvioFondos",
              context: {
                monto: data.monto,
                moneda: data.moneda,
                receptor: data.receptor,
                emisor: data.emisor,
                tipoEnvio: tipoEnvio,
              },
            };
            transporter.sendMail(mailOptionsFrom, function (error, info) {
              return true;
            });
          }
        }

        if (to != null) {
          // Envio al receptor
          const mailOptionsTo = {
            from: from_admin,
            to: to,
            subject: "Ha recibido fondos",
            template: "RecepcionFondos", // the name of the template file i.e email.handlebars
            context: {
              monto: data.monto,
              moneda: data.moneda,
              receptor: data.receptor,
              emisor: data.emisor,
            },
          };
          transporter.sendMail(mailOptionsTo, function (error, info) {
            return true;
          });
        }
      }
      break;
    case "swap":
      {
        var mailOptions = {
          from: from_admin,
          to: from,
          subject: "Notificacion de swap",
          template: "swap", // the name of the template file i.e email.handlebars
          context: {
            user: data.user,
            montoA: data.montoA,
            monedaA: data.monedaA,
            montoB: data.montoB,
            monedaB: data.monedaB,
          },
        };
        transporter.sendMail(mailOptions, function (error, info) {
          return true;
        });
      }
      break;
  }
}

async function getEmailFlagFN(defixId: string, tipo: string) {
  try {
    const users = await User.find({
      where: { defix_id: defixId },
      select: [
        "defix_id",
        "id",
        "email",
        "flag_send",
        "flag_receive",
        "flag_dex",
        "flag_fiat",
      ],
    });

    if (users.length > 0) {
      if (tipo === "SEND") {
        if (users[0].flag_send) {
          return users[0].email as string;
        } else {
          return false;
        }
      } else if (tipo === "RECEIVE") {
        if (users[0].flag_receive) {
          return users[0].email as string;
        } else {
          return false;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function EnviarPhraseCorreo(
  phrase: string,
  userdefix: string,
  to: string
) {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.PASS_MAIL,
    },
  });

  let from = process.env.USER_MAIL;

  // point to the template folder
  const handlebarOptions: NodemailerExpressHandlebarsOptions = {
    viewEngine: {
      partialsDir: path.resolve("./src/views_email/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./src/views_email/"),
  };

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));
  const mailOptions = {
    from: from,
    to: to,
    subject: "Phrase secreta para recuperacion de cuenta deFix3",
    template: "phraseEmail", // the name of the template file i.e email.handlebars
    context: {
      userdefix: userdefix,
      phrase: phrase,
    },
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("--------------------------------------------");
      console.log(error);
      console.log("--------------------------------------------");
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

export { EnvioCorreo, getEmailFlagFN, EnviarPhraseCorreo };
