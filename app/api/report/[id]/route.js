import { NextResponse } from "next/server";
import prisma from "@/prisma/PrismaClient";
import { deleteUploadedFile } from "@/app/lib/multer";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: "Valid report ID is required" }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: "Valid report ID is required" }, { status: 400 });
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const contentType = request.headers.get("content-type");
    let title, description, regionId, status, userId, name, imgUrl;

    if (contentType?.includes("multipart/form-data")) {
      const formData = await request.formData();

      title = formData.get("title");
      description = formData.get("description");
      regionId = formData.get("regionId");
      status = formData.get("status");
      userId = formData.get("userId");
      name = formData.get("name");
      imgUrl = formData.get("imgUrl");

      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof File) {
        if (existingReport.imgUrl) {
          const oldFilename = existingReport.imgUrl.split("/").pop();
          deleteUploadedFile(oldFilename);
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json({ success: false, error: "Invalid file type. Only images are allowed." }, { status: 400 });
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ success: false, error: "File size too large. Maximum 5MB allowed." }, { status: 400 });
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = imageFile.name.split(".").pop();
        const filename = `report-${uniqueSuffix}.${ext}`;

        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fs = require("fs");
        const path = require("path");
        const uploadsDir = path.join(process.cwd(), "public", "uploads", "reports");

        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);

        imgUrl = `/uploads/reports/${filename}`;
      }
    } else {
      const body = await request.json();
      ({ title, description, regionId, status, userId, name, imgUrl } = body);
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (name !== undefined) updateData.name = name;
    if (imgUrl !== undefined) updateData.imgUrl = imgUrl;

    if (regionId !== undefined) {
      const region = await prisma.region.findUnique({
        where: { id: parseInt(regionId) },
      });

      if (!region) {
        return NextResponse.json({ success: false, error: "Region not found" }, { status: 404 });
      }
      updateData.regionId = parseInt(regionId);
    }

    if (status !== undefined) {
      if (![0, 1, 2].includes(parseInt(status))) {
        return NextResponse.json({ success: false, error: "Invalid status value. Must be 0 (pending), 1 (approved), or 2 (rejected)" }, { status: 400 });
      }
      updateData.status = parseInt(status);

      if (parseInt(status) !== 0) {
        updateData.validatedAt = new Date();
      }
    }

    if (userId !== undefined) {
      if (userId !== null) {
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
        });

        if (!user) {
          return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }
        updateData.userId = parseInt(userId);
      } else {
        updateData.userId = null;
      }
    }

    const updatedReport = await prisma.report.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
      include: {
        region: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReport,
      message: "Report updated successfully",
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json({ success: false, error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context; 
    const { id } = await params; 

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ success: false, error: "Valid report ID is required" }, { status: 400 });
    }

    const existingReport = await prisma.report.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    if (existingReport.imgUrl) {
      const filename = existingReport.imgUrl.split("/").pop();
      deleteUploadedFile(filename);
    }

    await prisma.report.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json({ success: false, error: "Failed to delete report" }, { status: 500 });
  }
}
