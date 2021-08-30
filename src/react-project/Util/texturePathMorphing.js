import { EElementCategories } from "shared/CSharedCategories";

export const texturePathMorphing = (rawData) => {
  const dataFromServer = Object.assign({}, rawData);
  const objects = dataFromServer.objects.map((item) => {
    if (item.category === EElementCategories.STEP) {
      const texturePathFull = item.texturePath.split('/');
      let textureIcon = texturePathFull[texturePathFull.length - 1]
        .split('-')
        .join('')
        .toLowerCase();
      //icons names which was changed
      switch (textureIcon) {
        case 'googleadblockisawful':
          textureIcon = 'googlenotblocked';
        case 'salespagewvideo':
          textureIcon = 'salespagevideo';
        case 'googleads':
          textureIcon = 'googlenotblocked';
        case 'printad':
          textureIcon = 'print';
        case 'adnetwork':
          textureIcon = 'network';
      }
      texturePathFull[texturePathFull.length - 1] = textureIcon;
      item.texturePath = texturePathFull.join('/');
    }
    return item;
  });
  dataFromServer.objects = objects;

  return dataFromServer;
};
