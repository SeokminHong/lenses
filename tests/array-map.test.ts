import { useForm } from 'react-hook-form';
import { type Lens, type TopLevelLens, useLens } from '@hookform/lenses';
import { renderHook } from '@testing-library/react';
import { expectTypeOf } from 'vitest';

test('map can create a new lens', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { a: string }[] }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<TopLevelLens<{ items: { a: string }[] }>>();

  const itemLenses = result.current.lens.focus('items').map([{ a: '1' }, { a: '2' }], (_, item) => item.focus('a'));

  expectTypeOf(itemLenses).toEqualTypeOf<Lens<string>[]>();

  expect(itemLenses[0]?.interop()).toEqual({ name: 'items.0.a', control: result.current.form.control });
  expect(itemLenses[1]?.interop()).toEqual({ name: 'items.1.a', control: result.current.form.control });
});

test('map callback accepts a value and index', () => {
  const { result } = renderHook(() => {
    const form = useForm<{ items: { a: string; myId: string }[] }>();
    const lens = useLens({ control: form.control });
    return { lens, form };
  });

  expectTypeOf(result.current.lens).toEqualTypeOf<TopLevelLens<{ items: { a: string; myId: string }[] }>>();

  const items = result.current.lens.focus('items');
  const itemLenses = items.map(
    [
      { a: '1', myId: 'one' },
      { a: '2', myId: 'two' },
    ],
    (value, l, index) => ({ lens: l, interop: l.interop(), id: value.myId, index }),
  );

  expect(itemLenses[0]).toMatchObject({
    interop: { name: 'items.0', control: result.current.form.control },
    id: 'one',
    index: 0,
  });

  expect(itemLenses[1]).toMatchObject({
    interop: { name: 'items.1', control: result.current.form.control },
    id: 'two',
    index: 1,
  });
});
