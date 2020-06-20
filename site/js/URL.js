
// https://stackoverflow.com/a/4656873
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var urlVars = getUrlVars();
// TODO: give error message on bad URL?
//console.log(urlVars);
var URL = urlVars["server"];

export default URL;