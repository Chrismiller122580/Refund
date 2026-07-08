'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CatalogField } from '@/lib/integrations/field-catalog'
import type {
  IntegrationAuthType,
  PublicIntegrationConnection,
  PublicIntegrationFieldMapping,
} from '@/lib/integrations/types'
import {
  dangerButtonClass,
  inputClass,
  selectClass,
  panelClass,
  primaryButtonClass,
  secondaryButtonClass,
  subtlePanelClass,
  tdClass,
  thClass,
} from '@/lib/ui-classes'

type ProductTab = 'freedom' | 'gap'

interface IntegrationResponse {
  connection: PublicIntegrationConnection | null
  mappings: PublicIntegrationFieldMapping[]
  catalog: CatalogField[]
}

interface TestResult {
  contractNumber: string
  type: ProductTab
  inputs: Record<string, unknown>
  mappedFields: string[]
  missingRequired: string[]
  sourceFetchedAt: string
  rawPreview?: unknown
  error?: string
}

type DraftMapping = {
  clientId: string
  id?: string
  internalField: string
  externalField: string
  enabled: boolean
}

const AUTH_TYPES: IntegrationAuthType[] = ['none', 'bearer', 'api_key_header', 'basic']

function toDraftMappings(mappings: PublicIntegrationFieldMapping[]): DraftMapping[] {
  return mappings.map((mapping) => ({
    clientId: mapping.id,
    id: mapping.id,
    internalField: mapping.internalField,
    externalField: mapping.externalField,
    enabled: mapping.enabled,
  }))
}

interface IntegrationsPanelProps {
  apiKeyId: string
  apiKeyName: string
  userEmail: string
  onClose: () => void
}

export function IntegrationsPanel({
  apiKeyId,
  apiKeyName,
  userEmail,
  onClose,
}: IntegrationsPanelProps) {
  const integrationBase = `/api/admin/api-keys/${apiKeyId}/integrations`
  const [productTab, setProductTab] = useState<ProductTab>('freedom')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<IntegrationResponse | null>(null)

  const [baseUrl, setBaseUrl] = useState('')
  const [lookupPathTemplate, setLookupPathTemplate] = useState('/contracts/{contractNumber}')
  const [authType, setAuthType] = useState<IntegrationAuthType>('none')
  const [secretEnvKey, setSecretEnvKey] = useState('')
  const [headerName, setHeaderName] = useState('X-API-Key')
  const [isActive, setIsActive] = useState(false)

  const [savedMappings, setSavedMappings] = useState<DraftMapping[]>([])
  const [draftMappings, setDraftMappings] = useState<DraftMapping[]>([])
  const [savedConnection, setSavedConnection] = useState({
    baseUrl: '',
    lookupPathTemplate: '/contracts/{contractNumber}',
    authType: 'none' as IntegrationAuthType,
    secretEnvKey: '',
    headerName: 'X-API-Key',
    isActive: false,
  })

  const [newInternalField, setNewInternalField] = useState('')
  const [newExternalField, setNewExternalField] = useState('')
  const [testContractNumber, setTestContractNumber] = useState('')
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const refresh = useCallback(async (type: ProductTab) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${integrationBase}/${type}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? 'Failed to load integration settings')

      setData(payload)
      const connection = payload.connection as PublicIntegrationConnection | null
      const nextConnection = {
        baseUrl: connection?.baseUrl ?? '',
        lookupPathTemplate: connection?.lookupPathTemplate ?? '/contracts/{contractNumber}',
        authType: connection?.authType ?? 'none',
        secretEnvKey: connection?.authConfig?.secretEnvKey ?? '',
        headerName: connection?.authConfig?.headerName ?? 'X-API-Key',
        isActive: connection?.isActive ?? false,
      }
      setBaseUrl(nextConnection.baseUrl)
      setLookupPathTemplate(nextConnection.lookupPathTemplate)
      setAuthType(nextConnection.authType)
      setSecretEnvKey(nextConnection.secretEnvKey)
      setHeaderName(nextConnection.headerName)
      setIsActive(nextConnection.isActive)
      setSavedConnection(nextConnection)

      const mappings = toDraftMappings(payload.mappings as PublicIntegrationFieldMapping[])
      setSavedMappings(mappings)
      setDraftMappings(mappings)
      setTestResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load integration settings')
    } finally {
      setLoading(false)
    }
  }, [integrationBase])

  useEffect(() => {
    refresh(productTab)
  }, [productTab, refresh, apiKeyId])

  const isDirty = useMemo(() => {
    const connectionDirty =
      baseUrl !== savedConnection.baseUrl ||
      lookupPathTemplate !== savedConnection.lookupPathTemplate ||
      authType !== savedConnection.authType ||
      secretEnvKey !== savedConnection.secretEnvKey ||
      headerName !== savedConnection.headerName ||
      isActive !== savedConnection.isActive

    if (connectionDirty) return true
    if (draftMappings.length !== savedMappings.length) return true

    const savedById = new Map(savedMappings.map((mapping) => [mapping.clientId, mapping]))
    return draftMappings.some((mapping) => {
      const saved = savedById.get(mapping.clientId)
      if (!saved) return true
      return (
        mapping.externalField !== saved.externalField ||
        mapping.enabled !== saved.enabled ||
        mapping.internalField !== saved.internalField
      )
    })
  }, [
    authType,
    baseUrl,
    draftMappings,
    headerName,
    isActive,
    lookupPathTemplate,
    savedConnection,
    savedMappings,
    secretEnvKey,
  ])

  const saveAll = async () => {
    setSaving(true)
    setError(null)
    try {
      const connectionResponse = await fetch(`${integrationBase}/${productTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl,
          lookupPathTemplate,
          authType,
          authConfig: {
            secretEnvKey: secretEnvKey.trim() || undefined,
            headerName: headerName.trim() || undefined,
          },
          isActive,
        }),
      })
      const connectionPayload = await connectionResponse.json()
      if (!connectionResponse.ok) {
        throw new Error(connectionPayload.error ?? 'Failed to save connection')
      }

      const savedById = new Map(savedMappings.map((mapping) => [mapping.clientId, mapping]))
      const draftById = new Map(draftMappings.map((mapping) => [mapping.clientId, mapping]))

      for (const saved of savedMappings) {
        if (!draftById.has(saved.clientId) && saved.id) {
          const response = await fetch(`${integrationBase}/${productTab}/fields/${saved.id}`, {
            method: 'DELETE',
          })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error ?? 'Failed to remove mapping')
        }
      }

      for (const draft of draftMappings) {
        const saved = savedById.get(draft.clientId)
        if (!saved) {
          const response = await fetch(`${integrationBase}/${productTab}/fields`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              internalField: draft.internalField,
              externalField: draft.externalField,
            }),
          })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error ?? 'Failed to add mapping')
          continue
        }

        if (
          draft.id &&
          (draft.externalField !== saved.externalField || draft.enabled !== saved.enabled)
        ) {
          const response = await fetch(`${integrationBase}/${productTab}/fields/${draft.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              externalField: draft.externalField,
              enabled: draft.enabled,
            }),
          })
          const payload = await response.json()
          if (!response.ok) throw new Error(payload.error ?? 'Failed to update mapping')
        }
      }

      await refresh(productTab)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save integration settings')
    } finally {
      setSaving(false)
    }
  }

  const addMappingToDraft = () => {
    if (!newInternalField || !newExternalField.trim()) return
    setDraftMappings((current) => [
      ...current,
      {
        clientId: `new-${Date.now()}-${newInternalField}`,
        internalField: newInternalField,
        externalField: newExternalField.trim(),
        enabled: true,
      },
    ])
    setNewInternalField('')
    setNewExternalField('')
  }

  const updateDraftMapping = (
    clientId: string,
    updates: Partial<Pick<DraftMapping, 'externalField' | 'enabled'>>,
  ) => {
    setDraftMappings((current) =>
      current.map((mapping) =>
        mapping.clientId === clientId ? { ...mapping, ...updates } : mapping,
      ),
    )
  }

  const removeDraftMapping = (clientId: string) => {
    setDraftMappings((current) => current.filter((mapping) => mapping.clientId !== clientId))
  }

  const runTest = async () => {
    if (!testContractNumber.trim()) return
    setTesting(true)
    setError(null)
    setTestResult(null)
    try {
      const response = await fetch(`${integrationBase}/${productTab}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractNumber: testContractNumber }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setTestResult({
          contractNumber: testContractNumber,
          type: productTab,
          inputs: {},
          mappedFields: [],
          missingRequired: [],
          sourceFetchedAt: new Date().toISOString(),
          error: payload.error ?? 'Test failed',
        })
        return
      }
      setTestResult(payload)
    } catch (err) {
      setTestResult({
        contractNumber: testContractNumber,
        type: productTab,
        inputs: {},
        mappedFields: [],
        missingRequired: [],
        sourceFetchedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Test failed',
      })
    } finally {
      setTesting(false)
    }
  }

  const catalog = data?.catalog ?? []
  const mappedInternalFields = new Set(draftMappings.map((mapping) => mapping.internalField))
  const availableCatalogFields = catalog.filter((field) => !mappedInternalFields.has(field.key))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Integration for {apiKeyName}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Contract pull settings for <span className="font-medium">{userEmail}</span> using this API key.
            Each key has its own VSC and Gap field mappings.
          </p>
        </div>
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Close
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['freedom', 'gap'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setProductTab(tab)}
            className={productTab === tab ? primaryButtonClass : secondaryButtonClass}
          >
            {tab === 'freedom' ? 'VSC' : 'Gap'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading integration settings…</p>
      ) : (
        <>
          <section className={panelClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Connection</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Configure how {productTab === 'freedom' ? 'VSC' : 'Gap'} contract numbers are fetched
              from your external system.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Base URL
                </span>
                <input
                  className={inputClass}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://contracts.example.com"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lookup path template
                </span>
                <input
                  className={inputClass}
                  value={lookupPathTemplate}
                  onChange={(e) => setLookupPathTemplate(e.target.value)}
                  placeholder="/api/v1/freedom/contracts/{contractNumber}"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Auth type
                </span>
                <select
                  className={selectClass}
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value as IntegrationAuthType)}
                >
                  {AUTH_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 pt-7 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Integration active
              </label>

              {authType !== 'none' && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Secret env var
                    </span>
                    <input
                      className={inputClass}
                      value={secretEnvKey}
                      onChange={(e) => setSecretEnvKey(e.target.value)}
                      placeholder={productTab === 'freedom' ? 'FREEDOM_CONTRACT_API_KEY' : 'GAP_CONTRACT_API_KEY'}
                    />
                  </label>

                  {authType === 'api_key_header' && (
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Header name
                      </span>
                      <input
                        className={inputClass}
                        value={headerName}
                        onChange={(e) => setHeaderName(e.target.value)}
                        placeholder="X-API-Key"
                      />
                    </label>
                  )}
                </>
              )}
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Field mappings</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Map external JSON paths to calculator fields. Use dot notation for nested values.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className={thClass}>Calculator field</th>
                    <th className={thClass}>External field</th>
                    <th className={thClass}>Enabled</th>
                    <th className={thClass} />
                  </tr>
                </thead>
                <tbody>
                  {draftMappings.map((mapping) => {
                    const catalogField = catalog.find((field) => field.key === mapping.internalField)
                    return (
                      <tr key={mapping.clientId}>
                        <td className={tdClass}>
                          <div className="font-medium">{catalogField?.label ?? mapping.internalField}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{mapping.internalField}</div>
                        </td>
                        <td className={tdClass}>
                          <input
                            className={inputClass}
                            value={mapping.externalField}
                            onChange={(e) =>
                              updateDraftMapping(mapping.clientId, { externalField: e.target.value })
                            }
                          />
                        </td>
                        <td className={tdClass}>
                          <input
                            type="checkbox"
                            checked={mapping.enabled}
                            onChange={(e) =>
                              updateDraftMapping(mapping.clientId, { enabled: e.target.checked })
                            }
                          />
                        </td>
                        <td className={tdClass}>
                          <button
                            type="button"
                            onClick={() => removeDraftMapping(mapping.clientId)}
                            className={dangerButtonClass}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select
                className={selectClass}
                value={newInternalField}
                onChange={(e) => setNewInternalField(e.target.value)}
              >
                <option value="">Select calculator field</option>
                {availableCatalogFields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label} ({field.key})
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                value={newExternalField}
                onChange={(e) => setNewExternalField(e.target.value)}
                placeholder="ExternalField or nested.path"
              />
              <button type="button" onClick={addMappingToDraft} className={secondaryButtonClass}>
                Add mapping
              </button>
            </div>
          </section>

          <section className={panelClass}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Test lookup</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                className={`${inputClass} max-w-sm`}
                value={testContractNumber}
                onChange={(e) => setTestContractNumber(e.target.value)}
                placeholder="Contract number"
              />
              <button type="button" onClick={runTest} disabled={testing} className={primaryButtonClass}>
                {testing ? 'Testing…' : 'Test pull'}
              </button>
            </div>

            {testResult && (
              <div className={`mt-4 ${subtlePanelClass}`}>
                {testResult.error ? (
                  <p className="text-sm text-red-700 dark:text-red-300">{testResult.error}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Mapped {testResult.mappedFields.length} fields
                      {testResult.missingRequired.length > 0 &&
                        ` · Missing required: ${testResult.missingRequired.join(', ')}`}
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                      {JSON.stringify(testResult.inputs, null, 2)}
                    </pre>
                    {testResult.rawPreview !== undefined && (
                      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
                        {JSON.stringify(testResult.rawPreview, null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveAll}
              disabled={saving || !isDirty}
              className={primaryButtonClass}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {isDirty && !saving && (
              <p className="text-sm text-amber-700 dark:text-amber-300">Unsaved changes</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}