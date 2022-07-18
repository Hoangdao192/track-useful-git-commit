class Util {
    trim(string, character) {
        while (string[0] == character) {
            string = string.slice(1, string.length);
        }

        while(string[string.length - 1] == character) {
            string = string.slice(0, string.length - 1);
        }

        return string;
    }
}

module.exports = new Util;