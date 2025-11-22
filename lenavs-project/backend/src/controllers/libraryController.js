const LibraryItem = require('../models/Library');

// @desc    Obter todos os itens da biblioteca do usuário
// @route   GET /api/library
// @access  Private
exports.getLibraryItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    const query = { user: req.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const items = await LibraryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await LibraryItem.countDocuments(query);

    res.json({
      success: true,
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter itens por tipo
// @route   GET /api/library/type/:type
// @access  Private
exports.getLibraryItemsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const validTypes = ['audio', 'video', 'image', 'style'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo inválido'
      });
    }

    const items = await LibraryItem.find({ 
      user: req.user.id, 
      type 
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await LibraryItem.countDocuments({ 
      user: req.user.id, 
      type 
    });

    res.json({
      success: true,
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter item específico
// @route   GET /api/library/item/:id
// @access  Private
exports.getLibraryItem = async (req, res, next) => {
  try {
    const item = await LibraryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    // Verificar se o usuário tem permissão (é o dono ou o item é público)
    if (item.user.toString() !== req.user.id && !item.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este item'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Criar item na biblioteca
// @route   POST /api/library
// @access  Private
exports.createLibraryItem = async (req, res, next) => {
  try {
    const itemData = {
      ...req.body,
      user: req.user.id
    };

    const item = await LibraryItem.create(itemData);

    res.status(201).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Atualizar item da biblioteca
// @route   PUT /api/library/:id
// @access  Private
exports.updateLibraryItem = async (req, res, next) => {
  try {
    let item = await LibraryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    // Verificar se o usuário é o dono do item
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para atualizar este item'
      });
    }

    item = await LibraryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deletar item da biblioteca
// @route   DELETE /api/library/:id
// @access  Private
exports.deleteLibraryItem = async (req, res, next) => {
  try {
    const item = await LibraryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item não encontrado'
      });
    }

    // Verificar se o usuário é o dono do item
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este item'
      });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obter recursos públicos da comunidade
// @route   GET /api/library/community/public
// @access  Private
exports.getCommunityResources = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const query = { isPublic: true };
    
    if (type) {
      query.type = type;
    }

    const items = await LibraryItem.find(query)
      .populate('user', 'name avatar')
      .sort({ usageCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await LibraryItem.countDocuments(query);

    res.json({
      success: true,
      items,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    next(error);
  }
};
