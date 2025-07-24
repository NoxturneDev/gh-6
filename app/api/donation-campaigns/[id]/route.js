import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/PrismaClient";
import { processImage } from "@/app/lib/multer";

export async function GET(request, context) {
  try {
    const { params } = context;
    const id  = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid campaign ID" }, { status: 400 });
    }

    const campaign = await prisma.donationCampaign.findUnique({
      where: { id },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const progressPercentage = campaign.targetAmount > 0 ? Math.round((campaign.currentAmount / campaign.targetAmount) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...campaign,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error("Error fetching donation campaign:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch donation campaign" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid campaign ID" }, { status: 400 });
    }

    const existingCampaign = await prisma.donationCampaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const formData = await request.formData();

    const title = formData.get("title");
    const description = formData.get("description");
    const regionId = formData.get("regionId") ? parseInt(formData.get("regionId")) : undefined;
    const targetAmount = formData.get("targetAmount") ? parseFloat(formData.get("targetAmount")) : undefined;
    const deadline = formData.get("deadline") ? new Date(formData.get("deadline")) : undefined;
    const status = formData.get("status") ? parseInt(formData.get("status")) : undefined;
    const imageFile = formData.get("image");

    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (regionId) {
      const region = await prisma.region.findUnique({
        where: { id: regionId },
      });
      if (!region) {
        return NextResponse.json({ success: false, error: "Region not found" }, { status: 404 });
      }
      updateData.regionId = regionId;
    }
    if (targetAmount) updateData.targetAmount = targetAmount;
    if (deadline) {
      if (deadline <= new Date()) {
        return NextResponse.json({ success: false, error: "Deadline must be in the future" }, { status: 400 });
      }
      updateData.deadline = deadline;
    }
    if (status !== undefined && [0, 1, 2].includes(status)) {
      updateData.status = status;
    }

    if (imageFile && imageFile instanceof File) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ success: false, error: `Invalid file type: ${imageFile.type}` }, { status: 400 });
      }

      if (imageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "File size too large. Maximum 5MB allowed." }, { status: 400 });
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = imageFile.name.split(".").pop();
      const filename = `campaign-${uniqueSuffix}.${ext}`;

      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fs = require("fs");
      const path = require("path");
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "campaigns");

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      try {
        const processedFilename = await processImage(filePath, {
          width: 800,
          height: 600,
          quality: 80,
          format: "jpeg",
        });
        updateData.imageUrl = `/uploads/campaigns/${processedFilename}`;
        updateData.imgUrl = `/uploads/campaigns/${processedFilename}`;

        if (existingCampaign.imgUrl) {
          const oldImagePath = path.join(process.cwd(), "public", existingCampaign.imgUrl);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      } catch (processError) {
        console.log("Image processing failed, using original file:", processError.message);
        updateData.imageUrl = `/uploads/campaigns/${filename}`;
        updateData.imgUrl = `/uploads/campaigns/${filename}`;
      }
    }

    const updatedCampaign = await prisma.donationCampaign.update({
      where: { id },
      data: updateData,
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: "Donation campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating donation campaign:", error);
    return NextResponse.json({ success: false, error: "Failed to update donation campaign" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid campaign ID" }, { status: 400 });
    }

    const existingCampaign = await prisma.donationCampaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const donationCount = await prisma.donation.count({
      where: {
        regionId: existingCampaign.regionId,
      },
    });

    if (donationCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete campaign with existing donations. Consider archiving instead.",
        },
        { status: 400 }
      );
    }

    if (existingCampaign.imgUrl) {
      const fs = require("fs");
      const path = require("path");
      const imagePath = path.join(process.cwd(), "public", existingCampaign.imgUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.donationCampaign.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Donation campaign deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting donation campaign:", error);
    return NextResponse.json({ success: false, error: "Failed to delete donation campaign" }, { status: 500 });
  }
}
