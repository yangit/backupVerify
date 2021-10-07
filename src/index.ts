import './init';
import fs from "fs"
import instanceManager from "./instanceManager";
import { setConfig } from "./getConfig";
var stdin = fs.readFileSync(0).toString(); // STDIN_FILENO = 0
const configIn = JSON.parse(stdin)


const main = async ()=> {
    setConfig(configIn)
    console.log(configIn)
    const manager = instanceManager('integrity')
    await manager.up()
    console.log(111);
    await manager.down()
    console.log(222);
    process.exit()
}
main()



