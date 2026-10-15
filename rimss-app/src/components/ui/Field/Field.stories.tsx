import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, Input, Select } from './Field';

const meta = {
  title: 'UI/Field',
  component: Field,
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  render: () => (
    <Field>
      Search by name
      <Input type="search" placeholder="e.g. sweater" />
    </Field>
  ),
};

export const SelectField: Story = {
  render: () => (
    <Field>
      Sort by price
      <Select defaultValue="asc">
        <option value="asc">Low to high</option>
        <option value="desc">High to low</option>
      </Select>
    </Field>
  ),
};

export const Checkbox: Story = {
  render: () => (
    <Field inline>
      <input type="checkbox" />
      Discounted products only
    </Field>
  ),
};

export const CompactNumber: Story = {
  render: () => <Input compact type="number" min={1} defaultValue={2} aria-label="Quantity" />,
};
