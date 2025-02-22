/**
 * Formata os erros de validação do Zod em um objeto mais simples.
 *
 * @param {object} zodError - Erro lançado pelo Zod.
 * @returns {object} Erros formatados.
 */
const formatZodErrors = (zodError) => {
  return Object.fromEntries(
    Object.entries(zodError.format())
      .filter(([key]) => key !== '_errors')
      .map(([key, value]) => [
        key,
        Array.isArray(value?._errors) && value._errors.length > 0
          ? value._errors[0]
          : null,
      ])
  )
}

module.exports = formatZodErrors
