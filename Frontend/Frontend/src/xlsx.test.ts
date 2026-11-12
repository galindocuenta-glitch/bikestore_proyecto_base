// Runtime validation coverage for: downloadable Excel reports
import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadXlsx } from './xlsx'

describe('downloadXlsx', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('downloads an XLSX workbook with black text and report data', async () => {
    const anchor = { href: '', download: '', click: vi.fn() }
    vi.stubGlobal('document', { createElement: vi.fn(() => anchor) })
    vi.stubGlobal('window', { setTimeout: vi.fn() })
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    vi.spyOn(URL, 'revokeObjectURL')

    downloadXlsx([['Cliente', 'Total'], ['Ana', 12500]], 'informe-clientes')

    expect(anchor.download).toBe('informe-clientes.xlsx')
    expect(anchor.click).toHaveBeenCalledOnce()
    const workbook = createObjectUrl.mock.calls[0][0] as Blob
    const contents = new TextDecoder().decode(await workbook.arrayBuffer())
    expect(contents).toContain('<color rgb="FF000000"/>')
    expect(contents).toContain('Cliente')
    expect(contents).toContain('12500')
  })
})
