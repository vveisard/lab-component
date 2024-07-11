import { objectFromEntries } from "ts-extras";

/**
 * State of some components.
 * @remarks
 * Conceptually similar to an entity collection. A component collection differs from an entity collection, because all component ids are known ahead of time.
 */
type ComponentCollectionState<
  TComponentId extends PropertyKey,
  TComponentsState extends Record<TComponentId, any>
> = {
  // TODO investigate if I can strongly type archetype and states together

  /**
   * Describes which components are in this collection.
   * key: id of the component type.
   * value: present in this collection.
   * @remarks
   * Useful for tracking componetns in a collection reactively.
   *
   */
  readonly archetype: {
    [componentId in TComponentId]: boolean;
  };

  /**
   * State of components in this collection.
   */
  readonly states: {
    [componentId in keyof TComponentsState]?: NonNullable<
      TComponentsState[TComponentId]
    >;
  };
};

/**
 * Functions for {@link ComponentCollectionState}.
 */
namespace ComponentCollectionState {
  /**
   * Check if component exists in the collection.
   */
  export function hasComponent<
    TComponentId extends PropertyKey,
    TComponentsState extends Record<TComponentId, any>
  >(
    self: ComponentCollectionState<TComponentId, TComponentsState>,
    targetComponentId: TComponentId
  ): boolean {
    return self.archetype[targetComponentId];
  }

  /**
   * Create a new collection.
   * @param allComponentIds All possible component ids.
   * @param nextComponentStates State for next components in the collection.
   */
  export function create<
    TComponentId extends PropertyKey,
    TComponentsState extends Partial<Record<TComponentId, any>>
  >(
    allComponentIds: Array<TComponentId>,
    nextComponentStates: TComponentsState
  ): ComponentCollectionState<TComponentId, TComponentsState> {
    const nextArchetype = objectFromEntries(
      allComponentIds.map((iComponentId) => [
        iComponentId,
        nextComponentStates[iComponentId] !== undefined,
      ])
    );

    return {
      archetype: nextArchetype,
      states: nextComponentStates,
    };
  }

  /**
   * Create a new collection with the new component using immutable state update.
   * @throws when the component exists.
   */
  export function createViaAdd<
    TComponentId extends PropertyKey,
    TComponentsState extends Record<TComponentId, any>
  >(
    self: ComponentCollectionState<TComponentId, TComponentsState>,
    nextComponentId: TComponentId,
    nextComponentState: TComponentsState[TComponentId]
  ): ComponentCollectionState<TComponentId, TComponentsState> {
    if (ComponentCollectionState.hasComponent(self, nextComponentId)) {
      throw new Error(
        `Invalid operation! New component '${String(nextComponentId)}' exists. `
      );
    }

    return {
      ...self,
      [nextComponentId]: nextComponentState,
    };
  }

  /**
   * Create a new collection without the target component using immutable state update.
   * @throws when the component is missing.
   */
  export function createViaRemove<
    TComponentId extends PropertyKey,
    TComponentsState extends Record<TComponentId, any>
  >(
    self: ComponentCollectionState<TComponentId, TComponentsState>,
    targetComponentId: TComponentId
  ): ComponentCollectionState<
    Exclude<typeof targetComponentId, TComponentId>,
    Omit<TComponentsState, typeof targetComponentId>
  > {
    if (!ComponentCollectionState.hasComponent(self, targetComponentId)) {
      throw new Error(
        `Invalid operation! Target component '${String(
          targetComponentId
        )}' missing. `
      );
    }

    const { [targetComponentId]: _, ...nextStates } = self.states;
    const { [targetComponentId]: __, ...nextArchetype } = self.archetype;

    return {
      archetype: nextArchetype,
      states: nextStates,
    };
  }

  /**
   * Create a new collection with the new component using immutable state update.
   * @remarks
   * Does not throw when component exists.
   */
  export function createViaSet<
    TComponentId extends PropertyKey,
    TComponentsState extends Record<TComponentId, any>
  >(
    self: ComponentCollectionState<TComponentId, TComponentsState>,
    nextComponentId: TComponentId,
    nextComponentState: TComponentsState[TComponentId]
  ): ComponentCollectionState<TComponentId, TComponentsState> {
    if (self.archetype[nextComponentId] === false) {
      return {
        ...self,
        archetype: {
          ...self.archetype,
          [nextComponentId]: true,
        },
        [nextComponentId]: nextComponentState,
      };
    } else {
      return {
        ...self,
        archetype: self.archetype,
        [nextComponentId]: nextComponentState,
      };
    }
  }
}

export { ComponentCollectionState };
