import { Button, Card, Checkbox, Field, Heading, Input, Select } from '../../../components/ui';
import { useI18n } from '../../../i18n';
import type { Product, ProductFilters } from '../../../types/product';
import type { SortDirection } from '../searchParams';

interface SearchFiltersProps {
  filters: ProductFilters;
  sort: SortDirection;
  categories: string[];
  colors: string[];
  suggestions: Product[];
  qInput: string;
  onQueryChange: (value: string) => void;
  onFilterChange: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K] | '') => void;
  onSortChange: (sort: SortDirection) => void;
  onClear: () => void;
}

const MAX_PRICE = 300;

export function SearchFilters({
  filters,
  sort,
  categories,
  colors,
  suggestions,
  qInput,
  onQueryChange,
  onFilterChange,
  onSortChange,
  onClear,
}: Readonly<SearchFiltersProps>) {
  const { t } = useI18n();

  return (
    <Card
      as="aside"
      variant="filled"
      padding="md"
      className="product-search__filters"
      aria-label={t('search.filters')}
    >
      <Heading level={2}>{t('search.filters')}</Heading>

      <Field>
        {t('search.byName')}
        <Input
          type="search"
          placeholder={t('search.placeholder')}
          list="product-name-suggestions"
          value={qInput}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && qInput) onQueryChange('');
          }}
        />
        <datalist id="product-name-suggestions">
          {suggestions.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
      </Field>

      <OptionSelect
        label={t('search.category')}
        allLabel={t('search.allCategories')}
        options={categories}
        value={filters.category}
        onChange={(v) => onFilterChange('category', v)}
      />
      <OptionSelect
        label={t('search.color')}
        allLabel={t('search.allColors')}
        options={colors}
        value={filters.color}
        onChange={(v) => onFilterChange('color', v)}
      />

      <Field>
        {t('search.maxPrice', { price: filters.maxPrice ?? MAX_PRICE })}
        <Input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={10}
          value={filters.maxPrice ?? MAX_PRICE}
          onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
        />
      </Field>

      <Field inline>
        <Checkbox
          checked={Boolean(filters.discountedOnly)}
          onChange={(e) => onFilterChange('discountedOnly', e.target.checked)}
        />
        {t('search.discountedOnly')}
      </Field>

      <Field>
        {t('search.sortByPrice')}
        <Select value={sort} onChange={(e) => onSortChange(e.target.value as SortDirection)}>
          <option value="asc">{t('search.lowToHigh')}</option>
          <option value="desc">{t('search.highToLow')}</option>
        </Select>
      </Field>

      <Button variant="outline" onClick={onClear}>
        {t('search.clear')}
      </Button>
    </Card>
  );
}

function OptionSelect({
  label,
  allLabel,
  options,
  value,
  onChange,
}: Readonly<{
  label: string;
  allLabel: string;
  options: string[];
  value?: string;
  onChange: (value: string) => void;
}>) {
  return (
    <Field>
      {label}
      <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </Select>
    </Field>
  );
}
