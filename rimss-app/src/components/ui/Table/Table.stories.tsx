import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

const meta = {
  title: 'UI/Table',
  component: Table,
  args: {
    children: (
      <>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cashmere Scarf</td>
            <td>1</td>
            <td>$44.25</td>
          </tr>
          <tr>
            <td>Kids Corduroy Dungarees</td>
            <td>2</td>
            <td>$90.00</td>
          </tr>
          <tr>
            <td>Wool Sweater</td>
            <td>1</td>
            <td>$120.00</td>
          </tr>
        </tbody>
      </>
    ),
  },
} satisfies Meta<typeof Table>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Striped: Story = { args: { striped: true } };
export const Compact: Story = { args: { compact: true } };
