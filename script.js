import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from 'axios'
import prettybytes from "pretty-bytes";
import setupEditors from "./setupEditor";
import parseCurl from "parse-curl";

const queryParamsConatiner=document.querySelector('[data-query-params]');
const requestHeadersConatiner=document.querySelector('[data-request-headers]');

const KeyValueTemplate=document.querySelector('[data-key-value-template]');
const responseHeadersContainer=document.querySelector('[data-response-headers]');

document.querySelector('[data-add-query-param-btn]').addEventListener('click',(e)=>{
    queryParamsConatiner.append(createKeyValuePair());
})
document.querySelector('[data-add-request-header-btn]').addEventListener('click',(e)=>{
    requestHeadersConatiner.append(createKeyValuePair());
})

queryParamsConatiner.append(createKeyValuePair());
requestHeadersConatiner.append(createKeyValuePair());


const form = document.querySelector('form');

const runCurlBtn =
    document.querySelector('[data-run-curl]');

runCurlBtn?.addEventListener(
    'click',
    runCurlRequest
);

axios.interceptors.request.use((request)=>{
    request.customData=request.customData || {};
    request.customData.startTime=new Date().getTime();
    return request;
})

function updateEndTime(response){
    response.customData = response.customData || {};
    response.customData.time=new Date().getTime() - response.config.customData.startTime;
    return response;
}

axios.interceptors.response.use(updateEndTime,e=>{
    return Promise.reject(updateEndTime(e.response));
})
const {requestEditor,updateResponseEditor}=setupEditors();

form.addEventListener('submit', e => {
    e.preventDefault();

    let data = {};

    try {
        data = JSON.parse(
            requestEditor.state.doc.toString()
        );
    } catch (err) {
        alert("Invalid JSON");
        return;
    }

    axios({
        url: document.querySelector('[data-url]').value,
        method: document.querySelector('[data-select]').value,
        params: KeyValuePairsToObject(queryParamsConatiner),
        headers: KeyValuePairsToObject(requestHeadersConatiner),
        data: data
    })
    .catch(e => e)
    .then(response => {
    showResponse(response);
    updateCurlStatus(
    "success",
    `Request completed successfully (${response.status})`
);
});
});

function updateResponseDetails(response){
    document.querySelector('[data-status]').textContent=response.status;
    document.querySelector('[data-time]').textContent=response.customData.time;
    document.querySelector('[data-size]').textContent=prettybytes(
        JSON.stringify(response.data).length + JSON.stringify(response.headers).length
    );

}
function showResponse(response){

    document
        .querySelector('[data-response-section]')
        .classList.remove('d-none');

    updateResponseDetails(response);
    updateResponseEditor(response.data);
    updateResponseHeaders(response.headers);

    console.log(response);
}
function updateResponseHeaders(headers){
    responseHeadersContainer.innerHTML = "";
    Object.entries(headers).forEach(([key,value])=>{
        const keyElement=document.createElement('div');
        keyElement.textContent=key;
        responseHeadersContainer.append(keyElement);
        const valueElement=document.createElement('div');
        valueElement.textContent=value;
        responseHeadersContainer.append(valueElement);
    })
}
function updateCurlStatus(type, message){

    const status =
        document.querySelector('[data-curl-status]');

    status.innerHTML = `
        <div class="alert alert-${type} py-2 mb-0">
            ${message}
        </div>
    `;
}

function KeyValuePairsToObject(container){
    const pairs=container.querySelectorAll('[data-key-value-pair]');
    return [...pairs].reduce((data,pair)=>{
        const key=pair.querySelector('[data-key]').value;
        const value=pair.querySelector('[data-value]').value;

        if(key==='') return data;
        return{...data,[key]:value}
    },{})
}

function createKeyValuePair(){
    const element=KeyValueTemplate.content.cloneNode(true);
    element.querySelector('[data-remove-btn]').addEventListener("click",(e)=>{
        e.target.closest('[data-key-value-pair]').remove();
    })
    return element;
}
const themeBtn =
    document.querySelector('[data-theme-toggle]');

themeBtn.addEventListener('click', () => {

    const body = document.body;

    const current =
        body.getAttribute('data-bs-theme');

    body.setAttribute(
        'data-bs-theme',
        current === 'dark'
            ? 'light'
            : 'dark'
    );
});

async function runCurlRequest(){

    const btn =
        document.querySelector('[data-run-curl]');

    btn.disabled = true;
    btn.textContent = "Running...";

    const curlText =
        document.querySelector('[data-curl-input]').value;
        
        updateCurlStatus(
    "info",
    "Executing request..."
);

    try{

        const parsed =
            parseCurl(curlText);

        console.log(parsed);

        const response =
            await axios({

                url: parsed.url,

                method:
                    parsed.method || "GET",

                headers:
                    parsed.header || {},

                data:
                    parsed.body || {}

            });

        showResponse(response);
        updateCurlStatus(
    "success",
    `Request completed successfully (${response.status})`
);

    }
    catch(error){

        console.error(error);

        updateCurlStatus(
    "danger",
    "Invalid cURL command"
);

    }
    finally{

        btn.disabled = false;
        btn.textContent = "Run cURL";

    }
}