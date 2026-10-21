<script setup>
import { computed, ref } from 'vue'
import { ArrowUpRight, Check, CircuitBoard, Copy, ExternalLink, UserRound, X } from '@lucide/vue'

const language = ref('en')
const copied = ref(false)
const inviteInput = ref(null)
let copiedTimer = 0

const inviteUrl = computed(() => `${window.location.origin}/invite`)
const copiedLabel = computed(() => language.value === 'fr' ? 'Lien copié' : 'Link copied')

async function copyInviteLink() {
  let success = false
  try {
    await navigator.clipboard.writeText(inviteUrl.value)
    success = true
  } catch {
    const input = inviteInput.value
    if (input) {
      input.focus()
      input.select()
      success = document.execCommand('copy')
    }
  }
  if (!success) return
  copied.value = true
  window.clearTimeout(copiedTimer)
  copiedTimer = window.setTimeout(() => { copied.value = false }, 2200)
}
</script>

<template>
  <div class="invite-backdrop">
    <section class="invite-modal" role="dialog" aria-modal="true" :aria-label="language === 'fr' ? 'Présentation du projet Logic Lab' : 'Logic Lab project introduction'">
      <div class="invite-modal-topline">
        <span class="invite-overline"><span></span>{{ language === 'fr' ? 'PRÉSENTATION DU PROJET' : 'PROJECT INTRODUCTION' }}</span>
        <div class="invite-top-actions">
          <div class="invite-language-switch" role="group" :aria-label="language === 'fr' ? 'Choisir la langue' : 'Choose language'">
            <button type="button" :class="{ active: language === 'en' }" :aria-pressed="language === 'en'" @click="language = 'en'">EN</button>
            <button type="button" :class="{ active: language === 'fr' }" :aria-pressed="language === 'fr'" @click="language = 'fr'">FR</button>
          </div>
          <a class="invite-close" href="/" :aria-label="language === 'fr' ? 'Retour au studio' : 'Return to the studio'" :title="language === 'fr' ? 'Retour au studio' : 'Return to the studio'"><X :size="16" /></a>
        </div>
      </div>

      <header class="invite-brand-row">
        <div class="invite-brand-icon"><CircuitBoard :size="25" :stroke-width="1.8" /></div>
        <div>
          <p class="invite-brand-caption">{{ language === 'fr' ? 'STUDIO DE CIRCUITS' : 'CIRCUIT STUDIO' }}</p>
          <h1>Logic <span>Lab</span></h1>
        </div>
      </header>

      <div class="invite-purpose">
        <p v-if="language === 'en'">Build and test basic digital logic circuits right in your browser.</p>
        <p v-if="language === 'en'">See live signals and explore truth tables as you learn.</p>
        <p v-if="language === 'fr'">Construisez et testez des circuits logiques simples directement en ligne.</p>
        <p v-if="language === 'fr'">Suivez les signaux en direct et explorez les tables de vérité.</p>
      </div>

      <section class="invite-author-block" :aria-label="language === 'fr' ? 'Informations sur l’auteur' : 'Author information'">
        <p class="invite-section-label">{{ language === 'fr' ? 'CRÉÉ PAR' : 'CREATED BY' }}</p>
        <p class="invite-author-name">Nour Yahyaoui</p>
        <div class="invite-links">
          <a href="https://github.com/Nour-yahyaoui" target="_blank" rel="noopener noreferrer">
            <UserRound :size="15" /><span>{{ language === 'fr' ? 'Profil GitHub' : 'GitHub profile' }}</span><ExternalLink :size="12" />
          </a>
          <a href="https://github.com/Nour-yahyaoui/multisim-pro" target="_blank" rel="noopener noreferrer">
            <CircuitBoard :size="15" /><span>{{ language === 'fr' ? 'Dépôt du projet' : 'Project repository' }}</span><ExternalLink :size="12" />
          </a>
        </div>
      </section>

      <section class="invite-share-block">
        <label class="invite-section-label" for="invite-share-url">{{ language === 'fr' ? 'LIEN À PARTAGER' : 'SHAREABLE LINK' }}</label>
        <div class="invite-url-row">
          <input id="invite-share-url" ref="inviteInput" :value="inviteUrl" readonly @focus="$event.target.select()" />
          <button type="button" class="invite-copy-button" :class="{ copied }" :aria-label="copied ? copiedLabel : (language === 'fr' ? 'Copier le lien' : 'Copy link')" :title="copied ? copiedLabel : (language === 'fr' ? 'Copier le lien' : 'Copy link')" @click="copyInviteLink">
            <Check v-if="copied" :size="16" /><Copy v-else :size="15" />
          </button>
        </div>
        <span class="invite-copy-status" aria-live="polite">{{ copied ? copiedLabel : (language === 'fr' ? 'Copiez ce lien pour le partager.' : 'Copy this link to share the project.') }}</span>
      </section>

      <div class="invite-footer">
        <a class="invite-open-button" href="/">{{ language === 'fr' ? 'Ouvrir le studio' : 'Open the studio' }}<ArrowUpRight :size="15" /></a>
        <span>{{ language === 'fr' ? 'Un projet éducatif indépendant' : 'An independent educational project' }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.invite-backdrop {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(3, 8, 15, .78);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.invite-modal {
  position: relative;
  width: min(560px, 100%);
  max-height: min(780px, calc(100dvh - 48px));
  overflow-y: auto;
  padding: 29px 32px 25px;
  color: #dbe6f2;
  background: radial-gradient(ellipse at 4% 0%, rgba(57, 116, 133, .14), transparent 38%), #0d1521;
  border: 1px solid rgba(147, 173, 204, .18);
  border-radius: 18px;
  box-shadow: 0 32px 110px rgba(0, 0, 0, .58), inset 0 1px rgba(255,255,255,.035);
  animation: invite-rise .2s ease-out;
}
.invite-modal-topline, .invite-top-actions, .invite-overline, .invite-brand-row, .invite-links a, .invite-url-row, .invite-footer, .invite-open-button {
  display: flex;
  align-items: center;
}
.invite-modal-topline { justify-content: space-between; gap: 12px; margin-bottom: 28px; }
.invite-overline { gap: 8px; color: #8293a8; font-size: 8px; font-weight: 750; letter-spacing: .13em; }
.invite-overline > span { width: 6px; height: 6px; border-radius: 50%; background: #74ddc6; box-shadow: 0 0 10px rgba(116,221,198,.55); }
.invite-top-actions { gap: 8px; }
.invite-language-switch { display: flex; gap: 2px; padding: 3px; background: #111c2a; border: 1px solid rgba(147,173,204,.13); border-radius: 7px; }
.invite-language-switch button { min-width: 31px; height: 23px; padding: 0 5px; color: #728399; background: transparent; border: 0; border-radius: 4px; font: 700 8px Inter, sans-serif; cursor: pointer; }
.invite-language-switch button.active { color: #c4f4e8; background: rgba(105,207,181,.14); }
.invite-close { width: 30px; height: 30px; display: grid; place-items: center; color: #8393a7; background: #111b29; border: 1px solid rgba(147,173,204,.11); border-radius: 7px; text-decoration: none; }
.invite-close:hover { color: #e6eef7; background: #172335; }
.invite-brand-row { gap: 14px; margin-bottom: 22px; }
.invite-brand-icon { width: 48px; height: 48px; display: grid; place-items: center; color: #7be0c8; background: rgba(94,194,169,.1); border: 1px solid rgba(115,222,199,.18); border-radius: 13px; box-shadow: 0 0 28px rgba(61,167,143,.08); }
.invite-brand-caption { margin: 0 0 4px; color: #75879c; font-size: 8px; font-weight: 700; letter-spacing: .12em; }
.invite-brand-row h1 { margin: 0; color: #edf4fb; font-size: 26px; line-height: 1.05; letter-spacing: -.045em; }
.invite-brand-row h1 span { color: #7be0c8; }
.invite-purpose { padding: 17px 18px; margin-bottom: 22px; background: rgba(21, 35, 51, .77); border: 1px solid rgba(142,165,192,.11); border-radius: 10px; }
.invite-purpose p { margin: 0; color: #b3c2d2; font-size: 11px; line-height: 1.65; }
.invite-purpose p + p { margin-top: 8px; }
.invite-section-label { display: block; margin: 0 0 8px; color: #78899f; font-size: 8px; font-weight: 750; letter-spacing: .12em; }
.invite-author-block { padding-bottom: 19px; margin-bottom: 18px; border-bottom: 1px solid rgba(143,164,190,.1); }
.invite-author-name { margin: 0 0 12px; color: #e9f0f8; font-size: 15px; font-weight: 680; }
.invite-links { display: flex; flex-wrap: wrap; gap: 8px; }
.invite-links a { min-height: 31px; gap: 7px; padding: 0 9px; color: #9aabc0; background: #111c29; border: 1px solid rgba(143,164,190,.12); border-radius: 7px; text-decoration: none; font-size: 9px; transition: color .15s, border-color .15s, background .15s; }
.invite-links a:hover { color: #d9e7f4; background: #152336; border-color: rgba(115,222,199,.28); }
.invite-links a span { white-space: nowrap; }
.invite-share-block { margin-bottom: 23px; }
.invite-url-row { gap: 7px; }
.invite-url-row input { min-width: 0; flex: 1; height: 38px; padding: 0 10px; color: #a9bacd; background: #09111b; border: 1px solid rgba(143,164,190,.14); border-radius: 7px; outline: 0; font: 9px 'DM Mono', monospace; }
.invite-url-row input:focus { border-color: rgba(115,222,199,.42); }
.invite-copy-button { width: 38px; height: 38px; flex: 0 0 38px; display: grid; place-items: center; color: #a9bacd; background: #152236; border: 1px solid rgba(143,164,190,.15); border-radius: 7px; cursor: pointer; transition: .15s; }
.invite-copy-button:hover, .invite-copy-button.copied { color: #7be0c8; background: rgba(83,165,144,.15); border-color: rgba(115,222,199,.31); }
.invite-copy-status { display: block; min-height: 13px; margin-top: 7px; color: #6d7e92; font-size: 8px; }
.invite-footer { justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid rgba(143,164,190,.1); }
.invite-open-button { min-height: 34px; gap: 8px; padding: 0 12px; color: #061610; background: #79e0c7; border: 1px solid #79e0c7; border-radius: 7px; text-decoration: none; font-size: 9px; font-weight: 750; transition: background .15s, transform .15s; }
.invite-open-button:hover { background: #94ecd6; transform: translateY(-1px); }
.invite-footer > span { color: #66788d; text-align: right; font-size: 8px; }
@keyframes invite-rise { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 520px) {
  .invite-backdrop { align-items: start; padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom)); }
  .invite-modal { max-height: none; padding: 22px 19px 20px; border-radius: 14px; }
  .invite-modal-topline { margin-bottom: 23px; }
  .invite-purpose { padding: 15px 14px; }
  .invite-links { display: grid; grid-template-columns: 1fr; }
  .invite-links a { justify-content: flex-start; }
  .invite-footer { align-items: flex-start; flex-direction: column; }
  .invite-footer > span { text-align: left; }
}
@media (prefers-reduced-motion: reduce) {
  .invite-modal { animation: none; }
}
</style>
