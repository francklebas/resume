import { expect, test } from '@playwright/test'

test('crée un CV de base, l\'édite, et l\'autosave persiste après rechargement', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const createButton = page.getByRole('button', { name: 'Créer le CV de base' })
  if (await createButton.isVisible().catch(() => false)) {
    await createButton.click()
  }

  await page.getByRole('link', { name: 'Éditer' }).first().click({ timeout: 10000 })
  await page.waitForURL(/\/editor\//)

  const uniqueName = `Test E2E ${Date.now()}`
  const nameField = page.getByLabel('Nom')
  await nameField.fill(uniqueName)

  await expect(page.getByText('Enregistré')).toBeVisible({ timeout: 5000 })

  await page.reload()
  await expect(page.getByLabel('Nom')).toHaveValue(uniqueName)
})
