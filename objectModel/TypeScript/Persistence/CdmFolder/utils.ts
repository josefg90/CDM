import {
    AttributeGroupReferencePersistence,
    DataTypeReferencePersistence,
    EntityAttributePersistence,
    EntityReferencePersistence,
    PurposeReferencePersistence,
    TraitReferencePersistence,
    TypeAttributePersistence
} from '.';
import {
    ArgumentValue,
    CdmAttributeItem,
    CdmCollection,
    CdmCorpusContext,
    CdmArgumentCollection,
    CdmDocumentCollection,
    CdmDefinitionCollection,
    CdmEntityCollection,
    CdmFolderCollection,
    CdmImportCollection,
    CdmTraitCollection,
    CdmObject,
    CdmObjectDefinition,
    CdmObjectReference,
    CdmTraitReference,
    copyOptions,
    identifierRef,
    resolveOptions
} from '../../internal';
import {
    AttributeGroupReference,
    CdmJsonType,
    DataTypeReference,
    EntityAttribute,
    EntityReference,
    PurposeReference,
    TraitReference,
    TypeAttribute
} from './types';

function isTypeAttribute(object: object): object is TypeAttribute {
    return !('entity' in object);
}

function isEntityAttribute(object: object): object is EntityAttribute {
    return 'entity' in object;
}

function isAttributeGroupReference(object: object): object is AttributeGroupReference {
    return 'attributeGroupReference' in object;
}

/**
 * Converts a JSON object to a CdmCollection of TraitReferences
 */
export function createTraitReferenceArray(
    ctx: CdmCorpusContext,
    object: (string | TraitReference)[]): CdmTraitReference[] {
    if (!object || !object.map) { return; }

    const result: CdmTraitReference[] = [];
    object.forEach((traitReference: string | TraitReference) => {
        result.push(TraitReferencePersistence.fromData(ctx, traitReference));
    });

    return result;
}

/**
 * Adds all elements of an array to a CdmCollection
 */
export function addArrayToCdmCollection<T extends CdmObject>(cdmCollection: CdmCollection<T>, array: T[]): void {
    if (cdmCollection && array) {
        for (const element of array) {
            cdmCollection.push(element);
        }
    }
}

/**
 * Creates a list object that is a copy of the input IEnumerable object
 */
export function arrayCopyData<T>(
    resOpt: resolveOptions,
    source: CdmCollection<CdmObject> | CdmArgumentCollection | CdmDocumentCollection | CdmDefinitionCollection | CdmEntityCollection | CdmTraitCollection| CdmFolderCollection | CdmImportCollection | CdmObject[],
    options: copyOptions): T[] {
    if (!source || !source.length) {
        return undefined;
    }
    const casted: T[] = [];
    const l: number = source.length;
    for (let i: number = 0; i < l; i++) {
        const element: CdmObject =
            (source as CdmCollection<CdmObject>).allItems ? (source as CdmCollection<CdmObject>).allItems[i] : source[i];
        casted.push(element ? element.copyData(resOpt, options) as unknown as T : undefined);
    }

    return casted;
}

/**
 * Creates a CDM object from a JSON object
 */
export function createConstant(ctx: CdmCorpusContext, object: CdmJsonType): ArgumentValue {
    if (!object) {
        return undefined;
    }
    if (typeof object === 'string') {
        return object;
    } else {
        const objectproperties: string[] = Object.getOwnPropertyNames(object);
        const checkExistingProperty: (propertyName: string) => boolean
            = (propertyName: string): boolean => {
                return objectproperties.some(
                    (element: string) => {
                        return element === propertyName;
                    });
            };
        if (checkExistingProperty('purpose') || checkExistingProperty('dataType') || checkExistingProperty('entity')) {
            if (checkExistingProperty('dataType')) {
                return TypeAttributePersistence.fromData(ctx, object as TypeAttribute);
            } else if (checkExistingProperty('entity')) {
                return EntityAttributePersistence.fromData(ctx, object as EntityAttribute);
            } else {
                return object;
            }
        } else if (checkExistingProperty('purposeReference')) {
            return PurposeReferencePersistence.fromData(ctx, object as PurposeReference);
        } else if (checkExistingProperty('traitReference')) {
            return TraitReferencePersistence.fromData(ctx, object as TraitReference);
        } else if (checkExistingProperty('dataTypeReference')) {
            return DataTypeReferencePersistence.fromData(ctx, object as DataTypeReference);
        } else if (checkExistingProperty('entityReference')) {
            return EntityReferencePersistence.fromData(ctx, object as EntityReference);
        } else if (checkExistingProperty('attributeGroupReference')) {
            return AttributeGroupReferencePersistence.fromData(ctx, object as AttributeGroupReference);
        } else {
            return object;
        }
    }
}

/**
 * Converts a JSON object to an Attribute object
 */
export function createAttribute(ctx: CdmCorpusContext, object: (string | AttributeGroupReference | EntityAttribute | TypeAttribute))
    : CdmAttributeItem {
    if (!object) {
        return undefined;
    }

    if (typeof object === 'string' || isAttributeGroupReference(object)) {
        return AttributeGroupReferencePersistence.fromData(ctx, object);
    } else if (isEntityAttribute(object)) {
        return EntityAttributePersistence.fromData(ctx, object);
    } else if (isTypeAttribute(object)) {
        return TypeAttributePersistence.fromData(ctx, object);
    }
}

/**
 * Converts a JSON object to a CdmCollection of attributes
 */
export function createAttributeArray(
    ctx: CdmCorpusContext,
    object: (string | AttributeGroupReference | EntityAttribute | TypeAttribute)[]): CdmAttributeItem[] {
    if (!object) {
        return undefined;
    }

    const result: CdmAttributeItem[] = [];

    const l: number = object.length;
    for (let i: number = 0; i < l; i++) {
        const ea: (string | AttributeGroupReference | EntityAttribute | TypeAttribute) = object[i];
        result.push(createAttribute(ctx, ea));
    }

    return result;
}

/**
 * Create a copy of the reference object
 */
export function copyIdentifierRef(objRef: CdmObjectReference, resOpt: resolveOptions, options: copyOptions): string | identifierRef {
    const identifier: string = objRef.namedReference;
    if (!options || !options.stringRefs) {
        return identifier;
    }
    const resolved: CdmObjectDefinition = objRef.fetchObjectDefinition(resOpt);
    if (resolved === undefined) {
        return identifier;
    }

    return {
        corpusPath: resolved.atCorpusPath,
        identifier: identifier
    };
}
