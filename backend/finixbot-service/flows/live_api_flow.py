import logging
import requests
from typing import Tuple, Optional, Dict, Any
from config.settings import get_settings

logger = logging.getLogger(__name__)

# Keywords for live account intent matching
BALANCE_KEYWORDS = ["balance", "account balance", "how much money", "my balance", "savings balance"]
LOAN_KEYWORDS = ["my loan", "loan status", "applied loan", "loan application", "repayment schedule", "my loans"]
KYC_KEYWORDS = ["kyc status", "my kyc", "kyc approval", "kyc verified"]
TRANSACTION_KEYWORDS = ["recent transaction", "transaction history", "last transaction", "statement", "mini statement"]

class LiveAPIFlow:
    def __init__(self):
        self.settings = get_settings()

    def detect_intent(self, query: str) -> Optional[str]:
        q_lower = query.lower()
        for kw in BALANCE_KEYWORDS:
            if kw in q_lower:
                return "balance"
        for kw in LOAN_KEYWORDS:
            if kw in q_lower:
                return "loans"
        for kw in KYC_KEYWORDS:
            if kw in q_lower:
                return "kyc"
        for kw in TRANSACTION_KEYWORDS:
            if kw in q_lower:
                return "transactions"
        return None

    def execute_live_flow(self, intent: str, jwt: str, query: str) -> Tuple[str, str]:
        """
        Calls real banking-service backend using forwarded JWT, formats live account data into response.
        """
        headers = {"Authorization": f"Bearer {jwt}"}
        base_url = self.settings.BANKING_SERVICE_URL

        try:
            if intent == "balance":
                savings_resp = requests.get(f"{base_url}/api/accounts/balance?accountType=SAVINGS", headers=headers, timeout=5)
                current_resp = requests.get(f"{base_url}/api/accounts/balance?accountType=CURRENT", headers=headers, timeout=5)
                
                lines = ["Here are your active Finix Bank account balances:"]
                found = False

                if savings_resp.status_code == 200:
                    try:
                        s_bal = float(savings_resp.text.strip())
                        lines.append(f"• **SAVINGS Account**: ₹{s_bal:,.2f}")
                        found = True
                    except Exception:
                        pass

                if current_resp.status_code == 200:
                    try:
                        c_bal = float(current_resp.text.strip())
                        lines.append(f"• **CURRENT Account**: ₹{c_bal:,.2f}")
                        found = True
                    except Exception:
                        pass

                if found:
                    return "\n".join(lines), "live_api"
                else:
                    return "You currently have no active accounts or balance records registered with Finix Bank.", "live_api"

            elif intent == "loans":
                url = f"{base_url}/api/loans/my-loans"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    loans = data.get("data", data) if isinstance(data, dict) else data
                    if not isinstance(loans, list) or not loans:
                        return "You currently have no active or pending loan applications with Finix Bank.", "live_api"

                    lines = ["Here are your current loan application details:"]
                    for loan in loans:
                        l_id = loan.get("loanId") or loan.get("id") or "N/A"
                        l_type = loan.get("loanType", "General Loan")
                        amt = loan.get("amount", 0)
                        status = loan.get("status", "PENDING")
                        amt_num = float(amt) if isinstance(amt, (int, float, str)) and str(amt).replace('.', '', 1).isdigit() else 0
                        lines.append(f"• **Loan #{l_id} ({l_type})**: ₹{amt_num:,.2f} — Status: **{status}**")
                    return "\n".join(lines), "live_api"
                else:
                    return "Unable to retrieve your loan applications at this moment. If you are an operations employee or manager, please check the Employee Operations Desk.", "live_api"

            elif intent == "kyc":
                url = f"{base_url}/api/kyc/my"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    kyc_data = resp.json()
                    if isinstance(kyc_data, dict) and "data" in kyc_data:
                        kyc_data = kyc_data["data"]
                    status = kyc_data.get("status", "PENDING") if isinstance(kyc_data, dict) else "PENDING"
                    return f"Your digital KYC status is currently **{status}**.", "live_api"
                else:
                    return "Your digital KYC verification is currently in progress or awaiting document submission.", "live_api"

            elif intent == "transactions":
                url = f"{base_url}/api/transaction?page=0&size=5"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200:
                    data = resp.json()
                    txs = data.get("content", data) if isinstance(data, dict) else data
                    if isinstance(txs, dict) and "data" in txs:
                        txs = txs["data"]
                    if not isinstance(txs, list) or not txs:
                        return "No recent transaction logs found on your account.", "live_api"

                    lines = ["Here are your recent account transactions:"]
                    for tx in txs[:5]:
                        t_id = tx.get("transactionId") or tx.get("id") or "N/A"
                        amt = tx.get("amount", 0)
                        t_type = tx.get("nature") or tx.get("transactionType") or "TRANSFER"
                        status = tx.get("status", "SUCCESS")
                        amt_num = float(amt) if isinstance(amt, (int, float, str)) and str(amt).replace('.', '', 1).isdigit() else 0
                        lines.append(f"• **Tx #{t_id}** ({t_type}): ₹{amt_num:,.2f} — Status: **{status}**")
                    return "\n".join(lines), "live_api"

        except Exception as e:
            logger.error(f"Error in LiveAPIFlow for intent '{intent}': {str(e)}")
            return f"I recognized your request for live {intent} details, but couldn't reach the core banking server. Please check your connection.", "live_api"

        return "Could not process live request.", "live_api"

_live_flow_instance = None

def get_live_api_flow() -> LiveAPIFlow:
    global _live_flow_instance
    if _live_flow_instance is None:
        _live_flow_instance = LiveAPIFlow()
    return _live_flow_instance
