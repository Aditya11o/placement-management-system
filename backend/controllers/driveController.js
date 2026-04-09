const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new placement drive
exports.createDrive = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, jobIds } = req.body;

    const drive = await prisma.placementDrive.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'UPCOMING',
        jobs: {
          connect: jobIds ? jobIds.map(id => ({ id })) : []
        }
      },
      include: {
        jobs: true
      }
    });

    res.status(201).json({
      success: true,
      data: drive
    });
  } catch (error) {
    console.error('Error creating placement drive:', error);
    res.status(500).json({ success: false, message: 'Server error creating placement drive.' });
  }
};

// Get all placement drives with optional status filtering
exports.getDrives = async (req, res) => {
  try {
    const { status, timeframe } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    const drives = await prisma.placementDrive.findMany({
      where: filter,
      orderBy: {
        startDate: 'asc'
      },
      include: {
        jobs: {
          include: {
            recruiter: true
          }
        },
        _count: {
          select: { jobs: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: drives.length,
      data: drives
    });
  } catch (error) {
    console.error('Error fetching placement drives:', error);
    res.status(500).json({ success: false, message: 'Server error fetching placement drives.' });
  }
};

// Get a single drive by ID
exports.getDriveById = async (req, res) => {
  try {
    const drive = await prisma.placementDrive.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        jobs: {
          include: {
            recruiter: true,
            _count: {
              select: { applications: true }
            }
          }
        }
      }
    });

    if (!drive) {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }

    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    console.error('Error fetching placement drive:', error);
    res.status(500).json({ success: false, message: 'Server error fetching placement drive.' });
  }
};

// Update a placement drive
exports.updateDrive = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, connectJobIds, disconnectJobIds } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (status !== undefined) updateData.status = status;
    
    // Handle job connections if provided
    if (connectJobIds || disconnectJobIds) {
      updateData.jobs = {};
      if (connectJobIds && connectJobIds.length > 0) {
        updateData.jobs.connect = connectJobIds.map(id => ({ id }));
      }
      if (disconnectJobIds && disconnectJobIds.length > 0) {
        updateData.jobs.disconnect = disconnectJobIds.map(id => ({ id }));
      }
    }

    const drive = await prisma.placementDrive.update({
      where: {
        id: req.params.id
      },
      data: updateData,
      include: {
        jobs: true
      }
    });

    res.status(200).json({
      success: true,
      data: drive
    });
  } catch (error) {
    console.error('Error updating placement drive:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.status(500).json({ success: false, message: 'Server error updating placement drive.' });
  }
};

// Delete a placement drive
exports.deleteDrive = async (req, res) => {
  try {
    const drive = await prisma.placementDrive.delete({
      where: {
        id: req.params.id
      }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting placement drive:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Placement drive not found' });
    }
    res.status(500).json({ success: false, message: 'Server error deleting placement drive.' });
  }
};
