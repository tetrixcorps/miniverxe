let o=null;document.addEventListener("DOMContentLoaded",function(){lucide.createIcons(),l(),m(),x()});function l(){const e=localStorage.getItem("client_user_data");e?(o=JSON.parse(e),u()):window.location.href="/"}function u(){o&&(document.getElementById("welcome-message").textContent=`Welcome back, ${o.firstName} ${o.lastName}`,document.getElementById("user-avatar").innerHTML=`<span class="text-sm font-medium text-gray-700">${o.firstName.charAt(0)}${o.lastName.charAt(0)}</span>`,document.getElementById("company-name").value=o.company||"",document.getElementById("industry-select").value=o.industry||"construction")}async function m(){try{const e=localStorage.getItem("client_token");if(!e)throw new Error("No authentication token");const n=await fetch("/api/v1/analytics/dashboard",{headers:{Authorization:`Bearer ${e}`}});if(n.ok){const a=await n.json();p(a)}const t=await fetch("/api/v1/integrations/crm",{headers:{Authorization:`Bearer ${e}`}});if(t.ok){const a=await t.json();y(a)}if((await fetch("/api/v1/services/industry",{headers:{Authorization:`Bearer ${e}`}})).ok){const a=await t.json();g(a)}}catch(e){console.error("Error loading dashboard data:",e),h("Error loading dashboard data","error")}}function p(e){document.getElementById("total-calls").textContent=e.totalCalls||0,document.getElementById("active-integrations").textContent=e.activeIntegrations||0,document.getElementById("monthly-revenue").textContent=c(e.monthlyRevenue||0),document.getElementById("customer-satisfaction").textContent=`${e.customerSatisfaction||0}%`}function y(e){const n=document.getElementById("integrations-grid");if(!n)return;const t=[{name:"Salesforce",type:"salesforce",color:"blue"},{name:"HubSpot",type:"hubspot",color:"orange"},{name:"Pipedrive",type:"pipedrive",color:"green"},{name:"Zoho CRM",type:"zoho",color:"purple"}];n.innerHTML=t.map(s=>{const a=e.find(d=>d.type===s.type),i=a?.status==="connected";return`
          <div class="bg-white rounded-lg shadow p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-${s.color}-100 rounded-lg flex items-center justify-center">
                <i data-lucide="database" class="w-6 h-6 text-${s.color}-600"></i>
              </div>
              <div class="px-2 py-1 rounded-full text-xs font-medium ${i?"bg-green-100 text-green-800":"bg-gray-100 text-gray-800"}">
                ${i?"Connected":"Not Connected"}
              </div>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">${s.name}</h3>
            
            ${i&&a?`
              <div class="space-y-2">
                <p class="text-sm text-gray-600">Last sync: ${r(a.lastSync)}</p>
                <p class="text-sm text-gray-600">Records: ${a.recordsCount.toLocaleString()}</p>
                <div class="flex space-x-2 mt-4">
                  <button onclick="viewIntegration('${s.type}')" class="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    <i data-lucide="eye" class="w-4 h-4 inline mr-1"></i>
                    View
                  </button>
                  <button onclick="disconnectIntegration('${a.id}')" class="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700">
                    <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
                    Disconnect
                  </button>
                </div>
              </div>
            `:`
              <div class="space-y-4">
                <p class="text-sm text-gray-600">Connect your ${s.name} account to sync contacts and call logs.</p>
                <button onclick="connectIntegration('${s.type}')" class="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Connect ${s.name}
                </button>
              </div>
            `}
          </div>
        `}).join(""),lucide.createIcons()}function g(e){const n=document.getElementById("services-table-body");n&&(n.innerHTML=e.map(t=>`
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="w-2 h-2 rounded-full mr-3 ${t.status==="active"?"bg-green-400":t.status==="inactive"?"bg-red-400":"bg-yellow-400"}"></div>
              <div>
                <div class="text-sm font-medium text-gray-900">${t.name}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ${t.industry}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.status==="active"?"bg-green-100 text-green-800":t.status==="inactive"?"bg-red-100 text-red-800":"bg-yellow-100 text-yellow-800"}">
              ${t.status}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${t.callsToday}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${c(t.revenue)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${r(t.lastActivity)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex space-x-2">
              <button onclick="viewService('${t.id}')" class="text-blue-600 hover:text-blue-900">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
              <button onclick="editService('${t.id}')" class="text-green-600 hover:text-green-900">
                <i data-lucide="edit" class="w-4 h-4"></i>
              </button>
              <button onclick="deleteService('${t.id}')" class="text-red-600 hover:text-red-900">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join(""),lucide.createIcons())}function x(){const e=document.getElementById("services-search");e&&e.addEventListener("input",function(n){f(n.target.value)})}function f(e){document.querySelectorAll("#services-table-body tr").forEach(t=>{t.querySelector("td:first-child .text-sm").textContent.toLowerCase().includes(e.toLowerCase())?t.style.display="":t.style.display="none"})}function c(e){return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(e)}function r(e){return new Date(e).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function h(e,n="info"){const t=document.createElement("div");t.className=`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${n==="error"?"bg-red-100 text-red-800":n==="success"?"bg-green-100 text-green-800":"bg-blue-100 text-blue-800"}`,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{document.body.removeChild(t)},3e3)}
