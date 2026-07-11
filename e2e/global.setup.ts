import { createClient } from '@supabase/supabase-js'
import { test as setup } from '@playwright/test'

// Compte dédié aux tests E2E — créé une fois via l'API admin, réutilisé à chaque run.
// Les inscriptions publiques étant désactivées, on ne peut pas passer par le formulaire de signup.
export const E2E_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e-test@resumes.local'
export const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD || 'e2e-test-password-123!'

setup('crée le compte de test (si besoin) et s\'authentifie', async ({ page }) => {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SECRET_KEY manquants dans .env pour le setup E2E')
  }

  const admin = createClient(supabaseUrl, serviceKey)
  const { data: existing, error: listError } = await admin.auth.admin.listUsers()
  if (listError) throw listError

  if (!existing.users.some(u => u.email === E2E_EMAIL)) {
    const { error } = await admin.auth.admin.createUser({
      email: E2E_EMAIL,
      password: E2E_PASSWORD,
      email_confirm: true,
    })
    if (error) throw error
  }

  await page.goto('/login')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Email').fill(E2E_EMAIL)
  await page.getByPlaceholder('Mot de passe').fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL('/')

  await page.context().storageState({ path: 'e2e/.auth/user.json' })
})
