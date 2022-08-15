import "./styles/index.css";
import {QualifyForm} from "./components/qualify-form";
import {Header} from "./components/header";
import {ThankYou} from "./components/thank-you";
import {Footer} from "./components/footer";
import {Fonts} from "./components/fonts";
import {BasicForm} from "./components/basic-form";
import {BookAViewing} from "./components/book-a-viewing";
import {LoadingWidget} from "./components/utils";
import {buttonTailwindClasses} from "./lib/helpers";
import {dbConnections} from "./lib/dbEntities/connections";
import {propertiesEntity} from "./lib/dbEntities/properties";
import {checkFolderExists} from "./lib/node-common";

// const {checkFolderExists} = require('./lib/node-common');
export {
    QualifyForm, Header, ThankYou, Footer, Fonts, BasicForm, BookAViewing, LoadingWidget, buttonTailwindClasses,
    propertiesEntity, dbConnections, checkFolderExists
}