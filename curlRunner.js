import parseCurl from "parse-curl";

export async function executeCurl(curlText){

    const parsed = parseCurl(curlText);

    return {
        method: parsed.method || "GET",
        url: parsed.url,
        headers: parsed.header || {},
        data: parsed.body
    };
}