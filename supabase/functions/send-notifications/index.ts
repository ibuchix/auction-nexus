import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Existing envs
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://sdvakfhmoaoucmhbhwvy.supabase.co";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// New configurable envs (with safe defaults)
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "powiadomienia@autaro.pl";
const FROM_NAME = Deno.env.get("RESEND_FROM_NAME") ?? "Autaro";
// Hardcode the correct domains to avoid environment variable confusion
const SELLER_SITE_URL = "https://www.autaro.pl";
const DEALER_SITE_URL = "https://aukcja.autaro.pl";
const FROM_HEADER = `${FROM_NAME} <${FROM_EMAIL}>`;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY || "", {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    headers: {
      apikey: SERVICE_ROLE_KEY || "",
      Authorization: `Bearer ${SERVICE_ROLE_KEY || ""}`,
    },
  },
});
const resend = new Resend(RESEND_API_KEY || "");

// Branding assets
const BRAND_LOGO_URL = Deno.env.get("BRAND_LOGO_URL") ?? `${SELLER_SITE_URL}/lovable-uploads/4e69fd8b-b4ed-44b6-a32d-5a7193af37f3.png`;

// Custom email template for seller auction ended
function buildSellerAuctionEndedEmail(carSummary: { make?: string; model?: string; year?: number }, winningBid: number): string {
  const carTitle = `${carSummary.year ?? ""} ${carSummary.make ?? ""} ${carSummary.model ?? ""}`.trim();
  const formattedBid = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(winningBid);
  
  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <link href="https://fonts.googleapis.com/css?family=Heebo:ital,wght@0,400;0,500;0,600" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,700" rel="stylesheet" />
  <title>Oferta za Twój samochód jest już dostępna</title>
  <style>
    html,body{margin:0!important;padding:0!important;min-height:100%!important;width:100%!important;-webkit-font-smoothing:antialiased}*{-ms-text-size-adjust:100%}table,td,th{mso-table-lspace:0!important;mso-table-rspace:0!important;border-collapse:collapse}body,td,th,p,div,li,a,span{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;mso-line-height-rule:exactly}img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}@media(max-width:620px){.pc-project-body{min-width:0!important}.pc-project-container,.pc-component{width:100%!important}.pc-w620-padding-60-20-10-20{padding:60px 20px 10px 20px!important}.pc-w620-padding-35-35-35-35{padding:35px!important}.pc-w620-font-size-58px{font-size:48px!important}}
  </style>
</head>
<body style="width:100%!important;min-height:100%!important;margin:0!important;padding:0!important;font-weight:normal;color:#2D3A41;-webkit-font-smoothing:antialiased;background-color:#ffffff">
  <table class="pc-project-body" style="table-layout:fixed;width:100%;min-width:600px;background-color:#ffffff" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" valign="top">
        <table class="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:20px 0" align="left" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-60-20-10-20" style="padding:20px 40px 0;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:0 0 60px 0">
                                <a href="https://www.autaro.pl" target="_blank" style="text-decoration:none;display:inline-block">
                                  <img src="https://s1.designmodo.com/postcards/Color_logo_-_no_background_3-62d212ce.png" width="250" height="60" alt="Autaro" style="display:block;outline:0;line-height:100%;width:250px;height:auto;max-width:100%;border:0" />
                                </a>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="left" valign="top" style="padding:0 0 40px 0">
                                <div style="font-size:55px;line-height:107%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <span style="font-weight:400">Oferta za Twój samochód jest już dostępna</span><span style="font-weight:500">!</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:0 0 16px 0">Dzisiejsza aukcja Twojego samochodu <strong>${carTitle}</strong> właśnie się zakończyła, a my otrzymaliśmy najwyższą ofertę w wysokości <strong>${formattedBid}</strong>.</p>
                                  <p style="margin:0 0 16px 0">Wejdź teraz na panel główny swojego konta sprzedawcy na Autaro.pl, aby zobaczyć pełne szczegóły oferty i móc ją zaakceptować.</p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0">
                            <tr>
                              <td align="left">
                                <a style="display:inline-block;padding:14px 19px;border-radius:8px;background-color:#d81b24;font-family:'Heebo',Arial,Helvetica,sans-serif;font-weight:600;font-size:15px;line-height:24px;color:#ffffff;text-decoration:none" href="${SELLER_SITE_URL}/dashboard/seller" target="_blank">Sprawdź swoją ofertę tutaj!</a>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:16px 0">Po zaakceptowaniu poinformujemy zwycięski komis i będziemy Cię na bieżąco informować o odbiorze Twojego auta.</p>
                                  <p style="margin:16px 0">W razie pytań po prostu odpowiedz na tego maila lub zadzwoń do naszego zespołu obsługi klienta pod numer +48 459 569 800 – chętnie pomożemy.</p>
                                  <p style="margin:16px 0">Dziękujemy za wybór Autaro do sprzedaży swojego samochodu.</p>
                                  <p style="margin:16px 0">Pozdrawiamy,</p>
                                  <p style="margin:16px 0;font-weight:500">Zespół Autaro.pl<br>☎️ +48 459 569 800<br>💻 <a href="https://www.autaro.pl" style="color:#2828da;text-decoration:underline">https://www.autaro.pl</a></p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:40px 0">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td style="line-height:1px;font-size:1px;border-bottom:1px solid #454545">&nbsp;</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-35-35-35-35" style="padding:10px 40px;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 10px 0">
                                <div style="font-size:32px;line-height:42px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;font-weight:700;text-align:center">Nasi Partnerzy</div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/CV_LOGO_BLUE-100de287.png" width="200" height="28" alt="CV Logo" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/autobaza_logo-2f75d44e.png" width="200" height="57" alt="Autobaza" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" class="pc-component" style="width:600px;max-width:600px">
                      <tr>
                        <td style="padding:64px 0 0;border-top:1px solid #515151;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding:0 32px 40px 32px">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.instagram.com/autaro.pl?igsh=cWJsdmw3MjQzM2h6" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/5824fa1145af8c65daf7d1711c7c1a11.png" width="20" height="20" alt="Instagram" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.facebook.com/share/1FtEdJoydU/?mibextid=wwXIfr" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/6b9792335937bf7bdc7f02a4cc5cfaf0.png" width="20" height="20" alt="Facebook" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.tiktok.com/@autaro.pl_?_t=ZN-901Ze5hU79i&_r=1" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/2af904415ed6d2a464ea4a319c5271f5.png" width="20" height="20" alt="TikTok" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 30px 39px 30px">
                                <div style="font-size:14px;line-height:20px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;text-align:center">
                                  <a href="${SELLER_SITE_URL}/unsubscribe" style="text-decoration:underline;color:#454545">Tutaj</a> możesz zrezygnować z otrzymywania tych e-maili.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Custom email template for dealer bid accepted
function buildDealerBidAcceptedEmail(carSummary: { make?: string; model?: string; year?: number }): string {
  const carTitle = `${carSummary.year ?? ""} ${carSummary.make ?? ""} ${carSummary.model ?? ""}`.trim();
  
  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <link href="https://fonts.googleapis.com/css?family=Heebo:ital,wght@0,400;0,500;0,600" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,700" rel="stylesheet" />
  <title>Twoja oferta została zaakceptowana!</title>
  <style>
    html,body{margin:0!important;padding:0!important;min-height:100%!important;width:100%!important;-webkit-font-smoothing:antialiased}*{-ms-text-size-adjust:100%}table,td,th{mso-table-lspace:0!important;mso-table-rspace:0!important;border-collapse:collapse}body,td,th,p,div,li,a,span{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;mso-line-height-rule:exactly}img{border:0;outline:0;line-height:100%;text-decoration:none;-ms-interpolation-mode:bicubic}@media(max-width:620px){.pc-project-body{min-width:0!important}.pc-project-container,.pc-component{width:100%!important}.pc-w620-padding-60-20-10-20{padding:60px 20px 10px 20px!important}.pc-w620-padding-35-35-35-35{padding:35px!important}.pc-w620-font-size-58px{font-size:48px!important}}
  </style>
</head>
<body style="width:100%!important;min-height:100%!important;margin:0!important;padding:0!important;font-weight:normal;color:#2D3A41;-webkit-font-smoothing:antialiased;background-color:#ffffff">
  <table class="pc-project-body" style="table-layout:fixed;width:100%;min-width:600px;background-color:#ffffff" border="0" cellspacing="0" cellpadding="0" role="presentation">
    <tr>
      <td align="center" valign="top">
        <table class="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:20px 0" align="left" valign="top">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-60-20-10-20" style="padding:20px 40px 0;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:0 0 60px 0">
                                <a href="https://aukcja.autaro.pl" target="_blank" style="text-decoration:none;display:inline-block">
                                  <img src="https://s1.designmodo.com/postcards/Color_logo_-_no_background_3-62d212ce.png" width="250" height="60" alt="Autaro" style="display:block;outline:0;line-height:100%;width:250px;height:auto;max-width:100%;border:0" />
                                </a>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="left" valign="top" style="padding:0 0 40px 0">
                                <div style="font-size:55px;line-height:107%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <span style="font-weight:400">Twoja oferta została zaakceptowana</span><span style="font-weight:500">!</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:0 0 16px 0">Gratulacje! Twoja oferta za <strong>${carTitle}</strong> została zaakceptowana przez sprzedawcę!</p>
                                  <p style="margin:0 0 16px 0">Teraz przejdź do panelu wygranych aukcji, aby sprawdzić szczegóły i uzyskać dostęp do kontaktu z sprzedającym.</p>
                                  <p style="margin:0 0 16px 0"><strong>Ważne: Aby otrzymać dostęp do danych kontaktowych sprzedawcy oraz adresu lokalizacji auta, musisz opłacić opłatę aukcyjną Autaro.</strong></p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin:20px 0">
                            <tr>
                              <td align="left">
                                <a style="display:inline-block;padding:14px 19px;border-radius:8px;background-color:#d81b24;font-family:'Heebo',Arial,Helvetica,sans-serif;font-weight:600;font-size:15px;line-height:24px;color:#ffffff;text-decoration:none" href="https://aukcja.autaro.pl/dealer/won-vehicles" target="_blank">Zobacz szczegóły wygranego auta</a>
                              </td>
                            </tr>
                          </table>
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
                            <tr>
                              <td valign="top" align="left">
                                <div style="font-size:16px;line-height:160%;color:#454545;font-family:'Heebo',Arial,Helvetica,sans-serif">
                                  <p style="margin:16px 0;font-weight:600">Co dalej?</p>
                                  <ul style="margin:0 0 16px 0;padding-left:20px">
                                    <li style="margin:8px 0">Sprawdź szczegóły pojazdu i upewnij się, że odpowiada on Twoim oczekiwaniom.</li>
                                    <li style="margin:8px 0">Skontaktuj się ze sprzedającym, aby ustalić termin oględzin.</li>
                                    <li style="margin:8px 0">Podczas oględzin dokładnie sprawdź stan techniczny pojazdu.</li>
                                    <li style="margin:8px 0">Jeśli pojazd spełnia Twoje oczekiwania, finalizuj transakcję zgodnie z ustaleniami.</li>
                                  </ul>
                                  <p style="margin:16px 0">W razie pytań lub problemów skontaktuj się z naszym zespołem wsparcia dla dealerów pod numerem <strong>+48 459 567 877</strong> – chętnie pomożemy.</p>
                                  <p style="margin:16px 0">Powodzenia w finalizacji transakcji!</p>
                                  <p style="margin:16px 0">Pozdrawiamy,</p>
                                  <p style="margin:16px 0;font-weight:500">Zespół Autaro.pl<br>☎️ +48 459 567 877<br>💻 <a href="https://aukcja.autaro.pl" style="color:#2828da;text-decoration:underline">https://aukcja.autaro.pl</a></p>
                                </div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td valign="top" style="padding:40px 0">
                                <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td style="line-height:1px;font-size:1px;border-bottom:1px solid #454545">&nbsp;</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table class="pc-component" style="width:600px;max-width:600px" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
                      <tr>
                        <td valign="top" class="pc-w620-padding-35-35-35-35" style="padding:10px 40px;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 0 10px 0">
                                <div style="font-size:32px;line-height:42px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;font-weight:700;text-align:center">Nasi Partnerzy</div>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/CV_LOGO_BLUE-100de287.png" width="200" height="28" alt="CV Logo" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                              <td align="center" valign="middle" style="width:50%;padding:20px">
                                <img src="https://s1.designmodo.com/postcards/autobaza_logo-2f75d44e.png" width="200" height="57" alt="Autobaza" style="display:block;width:200px;height:auto;max-width:100%" />
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td valign="top">
                    <table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" class="pc-component" style="width:600px;max-width:600px">
                      <tr>
                        <td style="padding:64px 0 0;border-top:1px solid #515151;background-color:#ffffff">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td style="padding:0 32px 40px 32px">
                                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                  <tr>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.instagram.com/autaro.pl?igsh=cWJsdmw3MjQzM2h6" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/5824fa1145af8c65daf7d1711c7c1a11.png" width="20" height="20" alt="Instagram" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.facebook.com/share/1FtEdJoydU/?mibextid=wwXIfr" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/6b9792335937bf7bdc7f02a4cc5cfaf0.png" width="20" height="20" alt="Facebook" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                    <td align="center" style="padding:0 10px">
                                      <a href="https://www.tiktok.com/@autaro.pl_?_t=ZN-901Ze5hU79i&_r=1" target="_blank">
                                        <img src="https://s1.designmodo.com/postcards/2af904415ed6d2a464ea4a319c5271f5.png" width="20" height="20" alt="TikTok" style="display:block;width:20px;height:20px" />
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                              <td align="center" valign="top" style="padding:0 30px 39px 30px">
                                <div style="font-size:14px;line-height:20px;color:#454545;font-family:'Inter',Arial,Helvetica,sans-serif;text-align:center">
                                  <a href="https://aukcja.autaro.pl/unsubscribe" style="text-decoration:underline;color:#454545">Tutaj</a> możesz zrezygnować z otrzymywania tych e-maili.
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Generic email template for other notification types
function buildGenericEmailHtml(opts: { title: string; body: string; ctaText: string; ctaHref: string }) {
  const { title, body, ctaText, ctaHref } = opts;
  return `
  <div style="background:#f6f7f9;padding:24px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:640px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,0.06)">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #eef2f7;background:linear-gradient(90deg,#111827, #1f2937);">
          <img src="${BRAND_LOGO_URL}" alt="Autaro logo" style="height:28px;display:block;filter:brightness(200%)" />
        </td>
      </tr>
      <tr>
        <td style="padding:28px 24px 8px 24px;">
          <h1 style="margin:0 0 8px 0;font-size:20px;line-height:28px;color:#111827;">${title}</h1>
          <p style="margin:0 0 16px 0;font-size:14px;line-height:22px;color:#374151;">${body}</p>
          <a href="${ctaHref}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;font-size:14px">${ctaText}</a>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;color:#6b7280;font-size:12px;border-top:1px solid #eef2f7">
          © ${new Date().getFullYear()} Autaro. All rights reserved.
        </td>
      </tr>
    </table>
  </div>`;
}

function buildSellerReadyForPickupEmail(car: any): string {
  const carYear = car?.year ?? '';
  const carMake = car?.make ?? '';
  const carModel = car?.model ?? '';
  const carLabel = `${carYear} ${carMake} ${carModel}`.trim();

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<!--[if !mso]><!-->
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<!--<![endif]-->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
<meta name="x-apple-disable-message-reformatting" />
<link href="https://fonts.googleapis.com/css?family=Heebo:ital,wght@0,400;0,500" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,500;0,700" rel="stylesheet" />
<title>Komis jest gotowy odebrać Twój samochód</title>
<style>
html, body { margin: 0 !important; padding: 0 !important; min-height: 100% !important; width: 100% !important; -webkit-font-smoothing: antialiased; }
* { -ms-text-size-adjust: 100%; }
#outlook a { padding: 0; }
.ReadMsgBody, .ExternalClass { width: 100%; }
.ExternalClass, .ExternalClass p, .ExternalClass td, .ExternalClass div, .ExternalClass span, .ExternalClass font { line-height: 100%; }
table, td, th { mso-table-lspace: 0 !important; mso-table-rspace: 0 !important; border-collapse: collapse; }
u + .body table, u + .body td, u + .body th { will-change: transform; }
body, td, th, p, div, li, a, span { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; mso-line-height-rule: exactly; }
img { border: 0; outline: 0; line-height: 100%; text-decoration: none; -ms-interpolation-mode: bicubic; }
a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
.body .pc-project-body { background-color: transparent !important; }
@media (min-width: 621px) { .pc-lg-hide { display: none; } .pc-lg-bg-img-hide { background-image: none !important; } }
@media (max-width: 620px) {
.pc-project-body {min-width: 0px !important;} .pc-project-container, .pc-component {width: 100% !important;} .pc-sm-hide {display: none !important;} .pc-sm-bg-img-hide {background-image: none !important;} .pc-w620-padding-0-0-0-0 {padding: 0px 0px 0px 0px !important;} .pc-w620-padding-10-35-10-35 {padding: 10px 35px 10px 35px !important;} .pc-w620-padding-60-20-10-20 {padding: 60px 20px 10px 20px !important;} table.pc-w620-spacing-0-0-0-0 {margin: 0px 0px 0px 0px !important;} td.pc-w620-spacing-0-0-0-0,th.pc-w620-spacing-0-0-0-0{margin: 0 !important;padding: 0px 0px 0px 0px !important;} .pc-w620-itemsVSpacings-40 {padding-top: 20px !important;padding-bottom: 20px !important;} .pc-w620-itemsHSpacings-40 {padding-left: 20px !important;padding-right: 20px !important;} .pc-w620-padding-35-35-35-35 {padding: 35px 35px 35px 35px !important;} .pc-w620-itemsVSpacings-20 {padding-top: 10px !important;padding-bottom: 10px !important;} .pc-w620-itemsHSpacings-0 {padding-left: 0px !important;padding-right: 0px !important;} table.pc-w620-spacing-0-20-20-20 {margin: 0px 20px 20px 20px !important;} td.pc-w620-spacing-0-20-20-20,th.pc-w620-spacing-0-20-20-20{margin: 0 !important;padding: 0px 20px 20px 20px !important;} .pc-w620-valign-top {vertical-align: top !important;} td.pc-w620-halign-center,th.pc-w620-halign-center {text-align: center !important;text-align-last: center !important;} table.pc-w620-halign-center {float: none !important;margin-right: auto !important;margin-left: auto !important;} img.pc-w620-halign-center {margin-right: auto !important;margin-left: auto !important;} .pc-w620-itemsVSpacings-0 {padding-top: 0px !important;padding-bottom: 0px !important;} .pc-w620-itemsHSpacings-20 {padding-left: 10px !important;padding-right: 10px !important;} div.pc-w620-align-right,th.pc-w620-align-right,a.pc-w620-align-right,td.pc-w620-align-right {text-align: right !important;text-align-last: right !important;} table.pc-w620-align-right{float: none !important;margin-left: auto !important;margin-right: 0 !important;} img.pc-w620-align-right{margin-right: 0 !important;margin-left: auto !important;} .pc-w620-text-align-center {text-align: center !important;text-align-last: center !important;} .pc-w620-padding-32-0-0-0 {padding: 32px 0px 0px 0px !important;} .pc-g-ib{display: inline-block !important;} .pc-g-b{display: block !important;} .pc-g-rb{display: block !important;width: auto !important;} .pc-g-wf{width: 100% !important;} .pc-g-rpt{padding-top: 0 !important;} .pc-g-rpr{padding-right: 0 !important;} .pc-g-rpb{padding-bottom: 0 !important;} .pc-g-rpl{padding-left: 0 !important;}
}
@media (max-width: 520px) { .pc-w520-padding-10-30-10-30 {padding: 10px 30px 10px 30px !important;} .pc-w520-padding-30-30-30-30 {padding: 30px 30px 30px 30px !important;} }
</style>
<!--[if !mso]><!-->
<style>
@font-face { font-family: 'Heebo'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyse0mg.woff') format('woff'), url('https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiSyse0mm.woff2') format('woff2'); }
@font-face { font-family: 'Heebo'; font-style: normal; font-weight: 500; src: url('https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Euyyse0mg.woff') format('woff'), url('https://fonts.gstatic.com/s/heebo/v26/NGSpv5_NC0k9P_v6ZUCbLRAHxK1Euyyse0mm.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 500; src: url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZFhiA.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 400; src: url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZFhiA.woff2') format('woff2'); }
@font-face { font-family: 'Inter'; font-style: normal; font-weight: 700; src: url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZFhjg.woff') format('woff'), url('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZFhiA.woff2') format('woff2'); }
</style>
<!--<![endif]-->
<!--[if mso]>
<style type="text/css">.pc-font-alt { font-family: Arial, Helvetica, sans-serif !important; }</style>
<![endif]-->
<!--[if gte mso 9]>
<xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
<![endif]-->
</head>
<body class="body pc-font-alt" style="width: 100% !important; min-height: 100% !important; margin: 0 !important; padding: 0 !important; font-weight: normal; color: #2D3A41; mso-line-height-rule: exactly; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-variant-ligatures: normal; text-rendering: optimizeLegibility; -moz-osx-font-smoothing: grayscale; background-color: #ffffff;" bgcolor="#ffffff">
<table class="pc-project-body" style="table-layout: fixed; width: 100%; min-width: 600px; background-color: #ffffff;" bgcolor="#ffffff" border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td align="center" valign="top" style="width:auto;">
<table class="pc-project-container" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-padding-0-0-0-0" style="padding: 20px 0px 20px 0px;" align="left" valign="top">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tr><td valign="top">
<table class="pc-component" style="width: 600px; max-width: 600px;" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td valign="top" class="pc-w520-padding-10-30-10-30 pc-w620-padding-10-35-10-35" style="height: unset; background-color: #ffffff;" bgcolor="#ffffff">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tr><td valign="top" align="left">
<div class="pc-font-alt" style="text-decoration: none;">
<div style="font-size:1px;line-height:160%;text-align:left;text-align-last:left;color:#ffffff;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;">
<div style="font-family:'Heebo', Arial, Helvetica, sans-serif;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 1px; line-height: 160%;">Komis, który zakupił Twój samochód, wkrótce się z Tobą skontaktuje. Skontaktują się telefonicznie lub mailowo, aby ustalić termin i miejsce odbioru, które będą odpowiadały obu stronom.</span></div>
</div></div>
</td></tr>
</table></td></tr>
</table>
</td></tr>
<tr><td valign="top">
<table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" class="pc-component" style="width: 600px; max-width: 600px;">
<tr><td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
<table width="100%" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td valign="top" class="pc-w620-padding-60-20-10-20" style="padding: 20px 40px 0px 40px; height: unset; background-color: transparent;" bgcolor="transparent">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td valign="top" style="padding: 0px 0px 60px 0px; height: auto;">
<a class="pc-font-alt" href="https://www.autaro.pl" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: top;">
<img src="https://s1.designmodo.com/postcards/Color_logo_-_no_background_3-62d212ce.png" width="250" height="60" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 250px; height: auto; max-width: 100%; border: 0;" />
</a>
</td></tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tr><td valign="top" align="left">
<div class="pc-font-alt" style="text-decoration: none;">
<div style="font-size:16px;line-height:160%;text-align:left;text-align-last:left;color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;">
<div style="font-family:'Heebo', Arial, Helvetica, sans-serif;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Dzień dobry,</span><br><br><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Komis, który zakupił Twój samochód, będzie z Tobą w kontakcie. Skontaktują się telefonicznie lub mailowo, aby ustalić termin i miejsce odbioru, które będą odpowiadały obu stronom.</span></div>
<div><br></div>
<div style="font-family:'Heebo', Arial, Helvetica, sans-serif;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Podczas odbioru przedstawiciel komisu sprawdzi samochód, porównując go z profilem przesłanym na Autaro.pl. Gdy wszystko się zgadza i komis jest zadowolony z pojazdu, dokona płatności i wypełni wszystkie niezbędne dokumenty.</span></div>
<div><br></div>
<div style="font-family:'Heebo', Arial, Helvetica, sans-serif;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Po otrzymaniu pieniędzy możesz przekazać komisowi samochód, kluczyki oraz wszystkie dokumenty — i to wszystko! </span></div>
<div style="font-family:'Heebo', Arial, Helvetica, sans-serif;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Samochód został sprzedany przez&nbsp;Autaro.pl.</span></div>
</div></div>
</td></tr>
</table>
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%">
<tr><td valign="top" align="left">
<div class="pc-font-alt" style="text-decoration: none;">
<div style="font-size:16px;line-height:160%;text-align:left;text-align-last:left;">
<div><br></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">W razie pytań lub jakichkolwiek problemów prosimy o kontakt z naszym zespołem obsługi klienta pod numerem +48 459 569 800 lub mailowo na ten adres</span></div>
<div><br></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Dziękujemy za wybór Autaro do sprzedaży swojego samochodu.</span></div>
<div><br></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 16px; line-height: 160%;">Pozdrawiamy,</span></div>
<div><br></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 500; font-size: 16px; line-height: 160%;">Zespół Autaro.pl</span></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 500; font-size: 16px; line-height: 160%;">☎️ +48 459 569 800</span></div>
<div style="color:#454545;font-family:'Heebo', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;"><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; font-weight: 500; font-size: 16px; line-height: 160%;">💻&nbsp;</span><span style="font-family: 'Heebo', Arial, Helvetica, sans-serif; color: rgb(40, 40, 218); font-weight: 500; font-size: 16px; line-height: 160%; text-decoration: underline;">https://www.autaro.pl</span></div>
</div></div>
</td></tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td valign="top" style="padding: 40px 0px 40px 0px;">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin: auto;">
<tr><td valign="top" style="line-height: 1px; font-size: 1px; border-bottom: 1px solid #454545;">&nbsp;</td></tr>
</table></td></tr>
</table>
</td></tr>
</table></td></tr>
</table>
</td></tr>
<tr><td valign="top">
<table class="pc-component" style="width: 600px; max-width: 600px;" width="600" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td valign="top" class="pc-w520-padding-30-30-30-30 pc-w620-padding-35-35-35-35" style="padding: 10px 40px 10px 40px; height: unset; background-color: #ffffff;" bgcolor="#ffffff">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="top" style="padding: 0px 0px 10px 0px; height: auto;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%" style="margin-right: auto; margin-left: auto;">
<tr><td valign="top" align="center" style="padding: 0px 20px 0px 20px; height: auto;">
<div class="pc-font-alt" style="text-decoration: none;">
<div style="font-size:32px;line-height:42px;text-align:center;text-align-last:center;color:#454545;font-family:'Inter', Arial, Helvetica, sans-serif;letter-spacing:-0.2px;font-style:normal;">
<div style="font-family:'Inter', Arial, Helvetica, sans-serif;"><span style="font-family: 'Inter', Arial, Helvetica, sans-serif; font-size: 32px; line-height: 42px; font-weight: 700;">Nasi Partnerzy</span></div>
</div></div>
</td></tr>
</table></td></tr>
</table>
<table class="pc-width-fill pc-g-b" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody class="pc-g-b">
<tr class="pc-g-ib pc-g-wf">
<td class="pc-g-rb pc-g-rpt pc-g-wf pc-w620-itemsVSpacings-40" align="center" valign="middle" style="width: 50%; padding-top: 0px; padding-bottom: 0px;">
<table style="width: 100%;" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="middle">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="top" style="line-height: 1px; font-size: 1px;">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="top">
<img src="https://s1.designmodo.com/postcards/CV_LOGO_BLUE-100de287.png" width="200" height="28" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 200px; height: auto; max-width: 100%; border: 0;" />
</td></tr>
</table></td></tr>
</table></td></tr>
</table></td>
<td class="pc-w620-itemsHSpacings-40" valign="middle" style="padding-right: 20px; padding-left: 20px;" />
<td class="pc-g-rb pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-40" align="center" valign="middle" style="width: 50%; padding-top: 0px; padding-bottom: 0px;">
<table style="width: 100%;" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="middle">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="top" style="line-height: 1px; font-size: 1px;">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td align="center" valign="top">
<img src="https://s1.designmodo.com/postcards/autobaza_logo-2f75d44e.png" width="200" height="57" alt="" style="display: block; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 200px; height: auto; max-width: 100%; border: 0;" />
</td></tr>
</table></td></tr>
</table></td></tr>
</table></td>
</tr>
</tbody>
</table></td></tr>
</table>
</td></tr>
<tr><td valign="top">
<table width="600" border="0" cellspacing="0" cellpadding="0" role="presentation" align="center" class="pc-component" style="width: 600px; max-width: 600px;">
<tr><td class="pc-w620-spacing-0-0-0-0" width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
<table style="border-collapse: separate; border-spacing: 0px;" width="100%" align="center" border="0" cellspacing="0" cellpadding="0" role="presentation">
<tr><td valign="top" class="pc-w620-padding-32-0-0-0" style="padding: 64px 0px 0px 0px; height: unset; border-top: 1px solid #515151; background-color: #ffffff;" bgcolor="#ffffff">
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-spacing-0-20-20-20 pc-w620-valign-top pc-w620-halign-center" style="padding: 0px 32px 62px 32px;">
<table class="pc-width-fill pc-g-b pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody class="pc-g-b">
<tr class="pc-g-ib pc-g-wf">
<td class="pc-g-rb pc-g-rpt pc-g-rpb pc-g-wf pc-w620-itemsVSpacings-20" align="left" valign="middle" style="width: 100%; padding-top: 0px; padding-bottom: 0px;">
<table class="pc-w620-halign-center" style="width: 100%;" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center pc-w620-valign-top" align="center" valign="middle">
<table class="pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center" align="center" valign="top">
<table class="pc-w620-halign-center" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-valign-top pc-w620-halign-center" align="center">
<table class="pc-w620-halign-center" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="width:unset;" valign="top">
<table class="pc-width-hug pc-w620-halign-center" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tbody>
<tr>
<td class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0" valign="middle" style="width: 33.33%; padding-top: 0px; padding-bottom: 0px;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center pc-w620-valign-top" align="center" valign="middle">
<table class="pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center" align="center" valign="top" style="line-height: 1px; font-size: 1px;">
<a class="pc-font-alt" href="https://www.instagram.com/autaro.pl?igsh=cWJsdmw3MjQzM2h6" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: top;">
<img src="https://s1.designmodo.com/postcards/5824fa1145af8c65daf7d1711c7c1a11.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" alt="" />
</a></td></tr>
</table></td></tr>
</table></td>
<td class="pc-w620-itemsHSpacings-20" valign="middle" style="padding-right: 10px; padding-left: 10px;" />
<td class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0" valign="middle" style="width: 33.33%; padding-top: 0px; padding-bottom: 0px;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center pc-w620-valign-top" align="center" valign="middle">
<table class="pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center" align="center" valign="top" style="line-height: 1px; font-size: 1px;">
<a class="pc-font-alt" href="https://www.facebook.com/share/1FtEdJoydU/?mibextid=wwXIfr" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: top;">
<img src="https://s1.designmodo.com/postcards/6b9792335937bf7bdc7f02a4cc5cfaf0.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" alt="" />
</a></td></tr>
</table></td></tr>
</table></td>
<td class="pc-w620-itemsHSpacings-20" valign="middle" style="padding-right: 10px; padding-left: 10px;" />
<td class="pc-g-rpt pc-g-rpb pc-w620-itemsVSpacings-0" valign="middle" style="width: 33.33%; padding-top: 0px; padding-bottom: 0px;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center pc-w620-valign-top" align="center" valign="middle">
<table class="pc-w620-halign-center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-halign-center" align="center" valign="top" style="line-height: 1px; font-size: 1px;">
<a class="pc-font-alt" href="https://www.tiktok.com/@autaro.pl_?_t=ZN-901Ze5hU79i&amp;_r=1" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: top;">
<img src="https://s1.designmodo.com/postcards/2af904415ed6d2a464ea4a319c5271f5.png" class="" width="20" height="20" style="display: block; border: 0; outline: 0; line-height: 100%; -ms-interpolation-mode: bicubic; width: 20px; height: 20px;" alt="" />
</a></td></tr>
</table></td></tr>
</table></td>
</tr>
</tbody>
</table></td></tr>
</table></td></tr>
</table></td></tr>
</table></td></tr>
</table></td></tr>
</tbody>
</table></td></tr>
</table>
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
<tr><td class="pc-w620-align-right" align="left" valign="top" style="padding: 0px 30px 39px 30px; height: auto;">
<table border="0" cellpadding="0" cellspacing="0" role="presentation" class="pc-w620-align-right" width="100%" style="margin-right: auto; margin-left: auto;">
<tr><td valign="top" class="pc-w620-align-right" align="center">
<div class="pc-font-alt pc-w620-align-right" style="text-decoration: none;">
<div style="font-size:14px;line-height:20px;text-align:center;text-align-last:center;color:#454545;font-family:'Inter', Arial, Helvetica, sans-serif;font-style:normal;letter-spacing:0px;">
<div style="font-family:'Inter', Arial, Helvetica, sans-serif;" class="pc-w620-text-align-center"><a href="http://$[LI:UNSUBSCRIBE]$" target="_blank" rel="noopener noreferrer" title="Unsubscribe" style="text-decoration:none;color:inherit;color: rgb(69, 69, 69); font-family: 'Inter', Arial, Helvetica, sans-serif;"><span style="font-family: 'Inter', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 14px; line-height: 20px; text-decoration: underline;">Tutaj</span></a><span style="font-family: 'Inter', Arial, Helvetica, sans-serif; font-weight: 500; font-size: 14px; line-height: 20px;">&nbsp;</span><span style="font-family: 'Inter', Arial, Helvetica, sans-serif; font-weight: 400; font-size: 14px; line-height: 20px;">możesz zrezygnować z otrzymywania tych e-maili.</span></div>
</div></div>
</td></tr>
</table></td></tr>
</table>
</td></tr>
</table></td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table></td></tr>
</table></td></tr>
</table>
</body>
</html>`;
}

async function logEmailEvent(event: { type: string; carId: string; dealerId?: string; to: string; subject: string; messageId?: string }) {
  try {
    await supabase.from('email_notification_events').insert([
      {
        type: event.type,
        car_id: event.carId,
        dealer_id: event.dealerId ?? null,
        recipient_email: event.to,
        subject: event.subject,
        message_id: event.messageId ?? null,
        metadata: {}
      }
    ]);
  } catch (e) {
    console.error('[send-notifications] log_event_failed', { error: (e as Error)?.message });
  }
}

interface NotifyRequest {
  type: "seller_auction_ended" | "dealer_bid_accepted" | "dealer_bid_declined" | "seller_ready_for_pickup" | "seller_listing_reminder";
  carId?: string;
  dealerId?: string;
  winningBid?: number;
  sellerId?: string;
  sellerEmail?: string;
}

async function getSellerUserId(carId: string) {
  const summary = await getCarSummary(carId);
  return (summary as any)?.seller_id as string | undefined;
}

async function getDealerUserId(dealerId: string) {
  const { data, error } = await supabase.rpc('get_dealer_user_id', { p_dealer_id: dealerId });
  if (error) throw error;
  return data as string | undefined;
}

async function getUserEmail(userId: string) {
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw error;
  return data?.user?.email as string | undefined;
}

async function getCarSummary(carId: string) {
  const { data, error } = await supabase.rpc('get_car_summary_for_notifications', { p_car_id: carId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row as { seller_id?: string; title?: string; make?: string; model?: string; year?: number; auction_end_time?: string } | null;
}

async function getWinningBid(carId: string) {
  const { data, error } = await supabase
    .from('bids')
    .select('amount')
    .eq('car_id', carId)
    .order('amount', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error("[send-notifications] get_winning_bid_error", { carId, error: error.message });
    return 0;
  }
  return data?.amount ?? 0;
}

async function sendEmail(to: string, subject: string, html: string) {
  console.log("[send-notifications] email_sending", { to, from: FROM_HEADER, subject });

  // Use Resend's standard response shape
  const { data, error } = await resend.emails.send({
    from: FROM_HEADER,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error("[send-notifications] email_failed", {
      to,
      from: FROM_HEADER,
      subject,
      error: { name: error.name, message: error.message },
    });
    throw new Error(error.message || "Resend send failed");
  }

  console.log("[send-notifications] email_sent", {
    to,
    from: FROM_HEADER,
    subject,
    messageId: data?.id,
  });

  return { messageId: data?.id };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY secret" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing RESEND_API_KEY secret" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // --- Admin OR Cron Auth Guard (Variant B) ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const token = authHeader.replace("Bearer ", "");

    let isAuthorized = false;
    // Check if the token is the service role key (cron job / internal call)
    if (token === SERVICE_ROLE_KEY) {
      isAuthorized = true;
      console.log("[send-notifications] Authorized via service role key (cron/internal)");
    } else {
      // Try JWT auth for admin users
      const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const userClient = createClient(SUPABASE_URL, supabaseAnonKey);
      const { data: { user: authUser }, error: authError } = await userClient.auth.getUser(token);
      if (!authError && authUser) {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: authUser.id, _role: "admin" });
        if (isAdmin) {
          isAuthorized = true;
          console.log("[send-notifications] Authorized via admin JWT, user:", authUser.id);
        }
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    // --- End Auth Guard ---

    // Parse and log the request
    const { type, carId, dealerId, winningBid }: NotifyRequest = await req.json();
    console.log("[send-notifications] request_received", { type, carId, dealerId, winningBid, from: FROM_HEADER });

    const car = await getCarSummary(carId);
    const carLabel = car ? `${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim() : `Car ${carId}`;
    console.log("[send-notifications] car_summary", { carId, carLabel, title: car?.title });

    if (type === "seller_auction_ended") {
      const sellerUserId = await getSellerUserId(carId);
      console.log("[send-notifications] seller_lookup", { carId, sellerUserId });
      if (!sellerUserId) throw new Error("Seller not found for car");

      const email = await getUserEmail(sellerUserId);
      console.log("[send-notifications] seller_email_resolved", { sellerUserId, email });
      if (!email) throw new Error("Seller email not found");

      // Use provided winning bid OR fetch from database as fallback
      const finalWinningBid = winningBid !== undefined 
        ? winningBid 
        : await getWinningBid(carId);
      console.log("[send-notifications] winning_bid_fetched", { 
        carId, 
        winningBid: finalWinningBid, 
        source: winningBid !== undefined ? 'provided' : 'fetched' 
      });

      const subject = `Oferta za Twój samochód jest już dostępna - ${carLabel}`;
      const html = buildSellerAuctionEndedEmail(car || {}, finalWinningBid);
      const { messageId } = await sendEmail(email, subject, html);

      // Mark that we sent notification (via SECURITY DEFINER RPC)
      const { data: markData, error: markError } = await supabase.rpc('mark_car_email_notification_sent', { p_car_id: carId });
      console.log("[send-notifications] notification_marked", { carId, result: markData, error: markError?.message });

      // Log event
      await logEmailEvent({ type, carId, to: email, subject, messageId });
      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === "dealer_bid_accepted") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      console.log("[send-notifications] dealer_lookup", { dealerId, dealerUserId });
      if (!dealerUserId) throw new Error("Dealer user not found");

      const email = await getUserEmail(dealerUserId);
      console.log("[send-notifications] dealer_email_resolved", { dealerUserId, email });
      if (!email) throw new Error("Dealer email not found");

      const subject = `Twoja oferta została zaakceptowana - ${carLabel}`;
      const html = buildDealerBidAcceptedEmail(car || {});
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, dealerId, to: email, subject, messageId });
      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
        dealerId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === "dealer_bid_declined") {
      if (!dealerId) throw new Error("dealerId is required");
      const dealerUserId = await getDealerUserId(dealerId);
      console.log("[send-notifications] dealer_lookup", { dealerId, dealerUserId });
      if (!dealerUserId) throw new Error("Dealer user not found");

      const email = await getUserEmail(dealerUserId);
      console.log("[send-notifications] dealer_email_resolved", { dealerUserId, email });
      if (!email) throw new Error("Dealer email not found");

      const subject = `Bid declined for ${carLabel}`;
      const html = buildGenericEmailHtml({
        title: 'Update on your bid',
        body: `Your bid for <strong>${carLabel}</strong> was declined by the seller. You can continue browsing and bidding on other vehicles.`,
        ctaText: 'Browse auctions',
        ctaHref: `${DEALER_SITE_URL}/auctions`
      });
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, dealerId, to: email, subject, messageId });
      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
        dealerId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (type === "seller_ready_for_pickup") {
      const sellerUserId = await getSellerUserId(carId);
      console.log("[send-notifications] seller_lookup_pickup", { carId, sellerUserId });
      if (!sellerUserId) throw new Error("Seller not found for car");

      const email = await getUserEmail(sellerUserId);
      console.log("[send-notifications] seller_email_resolved_pickup", { sellerUserId, email });
      if (!email) throw new Error("Seller email not found");

      const subject = `Komis jest gotowy odebrać Twój samochód - ${carLabel}`;
      const html = buildSellerReadyForPickupEmail(car || {});
      const { messageId } = await sendEmail(email, subject, html);

      // Log event
      await logEmailEvent({ type, carId, to: email, subject, messageId });
      return new Response(JSON.stringify({
        success: true,
        type,
        to: email,
        from: FROM_HEADER,
        subject,
        messageId,
        carId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      return new Response(JSON.stringify({ error: "Unsupported type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (err: any) {
    console.error("[send-notifications] error", { message: err?.message, stack: err?.stack });
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
